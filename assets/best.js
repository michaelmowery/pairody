// Pairody best scores. Kept in this browser's localStorage, so each device keeps its own.
// A score is fewer moves first; a tie goes to the faster time.
const Best={
  get(key){try{const v=JSON.parse(localStorage.getItem("pairody-best:"+key));return v&&v.moves>0?v:null}catch(e){return null}},
  // Returns {isNew, prev}. Saves only when the new score beats the old one.
  record(key,moves,secs){
    const prev=Best.get(key);
    const isNew=!prev||moves<prev.moves||(moves===prev.moves&&secs<prev.secs);
    if(isNew){try{localStorage.setItem("pairody-best:"+key,JSON.stringify({moves,secs,at:Date.now()}))}catch(e){}}
    return {isNew,prev};
  },
  fmt(b){return b?b.moves+" · "+Math.floor(b.secs/60)+":"+String(b.secs%60).padStart(2,"0"):"—"},
  // Short, stable key for a list of strings (for boards built from loose song links)
  hash(list){let h=5381;for(const ch of list.join(","))h=((h<<5)+h+ch.charCodeAt(0))|0;return (h>>>0).toString(36)}
};

// Clear bests left over from decks that were removed (Drums, Chords, Rhythms, Nov 2026).
try{["drums","chords","rhythm"].forEach(d=>["",":easy"].forEach(e=>localStorage.removeItem("pairody-best:"+d+e)))}catch(e){}
