import Foundation
import StoreKit
import Capacitor

// Pairody Plus: a one-time unlock bought through the App Store (StoreKit 2, no third-party SDK).
// The web page (assets/plus.js) talks to this through window.Capacitor.nativePromise("PairodyStore", ...):
//   status()   -> { plus, price, available }   Does this Apple ID own Plus? What does it cost here?
//   purchase() -> { plus, result }             Shows Apple's purchase sheet. result: purchased |
//                                              cancelled | pending (Ask to Buy) | unavailable
//   restore()  -> { plus }                     "Restore purchases": syncs with the App Store
// When Plus arrives some other way (Ask to Buy approved, an offer code redeemed, a refund taken
// back), the page gets a window event "pairodyplus" with { plus }.
// Product id must match the in-app purchase made in App Store Connect (and Pairody.storekit).
@objc(PlusStorePlugin)
public class PlusStorePlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "PlusStorePlugin"
    public let jsName = "PairodyStore"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "status", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "purchase", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "restore", returnType: CAPPluginReturnPromise)
    ]

    static let productId = "com.mountmtech.pairody.plus"
    private var updates: Task<Void, Never>?

    @objc override public func load() {
        // Purchases that finish outside the purchase sheet (Ask to Buy, offer codes, refunds)
        updates = Task { [weak self] in
            for await result in Transaction.updates {
                if case .verified(let t) = result {
                    await t.finish()
                    if t.productID == PlusStorePlugin.productId { await self?.announce() }
                }
            }
        }
    }

    deinit { updates?.cancel() }

    private func owned() async -> Bool {
        for await result in Transaction.currentEntitlements {
            if case .verified(let t) = result, t.productID == PlusStorePlugin.productId, t.revocationDate == nil {
                return true
            }
        }
        return false
    }

    private func product() async -> Product? {
        try? await Product.products(for: [PlusStorePlugin.productId]).first
    }

    private func announce() async {
        let plus = await owned()
        await MainActor.run { self.bridge?.triggerWindowJSEvent(eventName: "pairodyplus", data: "{\"plus\":\(plus)}") }
    }

    @objc func status(_ call: CAPPluginCall) {
        Task {
            let plus = await owned()
            let p = await product()
            call.resolve(["plus": plus, "price": p?.displayPrice ?? "", "available": p != nil])
        }
    }

    @objc func purchase(_ call: CAPPluginCall) {
        Task {
            guard let p = await product() else {
                call.resolve(["plus": await owned(), "result": "unavailable"])
                return
            }
            do {
                switch try await p.purchase() {
                case .success(let verification):
                    if case .verified(let t) = verification {
                        await t.finish()
                        call.resolve(["plus": true, "result": "purchased"])
                    } else {
                        call.resolve(["plus": await owned(), "result": "unverified"])
                    }
                case .pending:
                    call.resolve(["plus": false, "result": "pending"])
                case .userCancelled:
                    call.resolve(["plus": await owned(), "result": "cancelled"])
                @unknown default:
                    call.resolve(["plus": await owned(), "result": "cancelled"])
                }
            } catch {
                call.reject(error.localizedDescription)
            }
        }
    }

    @objc func restore(_ call: CAPPluginCall) {
        Task {
            // AppStore.sync may ask the player to sign in; that's expected for Restore purchases.
            try? await AppStore.sync()
            call.resolve(["plus": await owned()])
        }
    }
}

// The app's web view. Same as Capacitor's own, plus the Plus store above (an in-app plugin has to
// be registered by hand; npm plugins are found automatically).
class PairodyViewController: CAPBridgeViewController {
    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(PlusStorePlugin())
    }
}
