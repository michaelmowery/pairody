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
  // Every cleared game for a key, so the Well done card can say how this one ranks ("2nd best
  // of 10 games"). localStorage "pairody-plays:<key>" = [[moves,secs],...], newest last, the
  // last 200 kept. Started 2026-11-17: a best from before then is counted as one earlier game.
  // Call before record() so the old best can seed the list. Returns {rank, of}; ties share a rank.
  play(key,moves,secs){
    const k="pairody-plays:"+key;let h=[];
    try{h=JSON.parse(localStorage.getItem(k))||[]}catch(e){}
    if(!Array.isArray(h))h=[];
    if(!h.length){const b=Best.get(key);if(b)h.push([b.moves,b.secs])}
    const rank=1+h.filter(([m,s])=>m<moves||(m===moves&&s<secs)).length;
    h.push([moves,secs]);if(h.length>200)h=h.slice(-200);
    try{localStorage.setItem(k,JSON.stringify(h))}catch(e){}
    return {rank,of:h.length};
  },
  fmt(b){return b?b.moves+" · "+Math.floor(b.secs/60)+":"+String(b.secs%60).padStart(2,"0"):"—"},
  // Short, stable key for a list of strings (for boards built from loose song links)
  hash(list){let h=5381;for(const ch of list.join(","))h=((h<<5)+h+ch.charCodeAt(0))|0;return (h>>>0).toString(36)}
};

// Timed games used to keep their own bests ("<key>~timed" before the labels part). Since
// 2026-11-17 they share the untimed best (Michael: the clock doesn't change how fast you play),
// so fold any old "~timed" best and game history into the plain key once, keeping the better best.
try{
  const ks=[];for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.includes("~timed"))ks.push(k)}
  for(const k of ks){
    const to=k.replace("~timed","");
    if(k.startsWith("pairody-best:")){
      const key=k.slice(13),b=Best.get(key);if(b)Best.record(to.slice(13),b.moves,b.secs);
    }else if(k.startsWith("pairody-plays:")){
      const rd=x=>{try{const v=JSON.parse(localStorage.getItem(x));return Array.isArray(v)?v:[]}catch(e){return []}};
      let h=rd(to);
      // An untimed history that hasn't started yet is seeded from its old best first, as play() would
      if(!h.length){const b=Best.get(to.slice(14));if(b)h.push([b.moves,b.secs])}
      h=h.concat(rd(k)).slice(-200);localStorage.setItem(to,JSON.stringify(h));
    }else continue;
    localStorage.removeItem(k);
  }
}catch(e){}

// Clear bests left over from decks that were removed (Drums, Chords, Rhythms, Nov 2026).
try{["drums","chords","rhythm"].forEach(d=>["",":easy"].forEach(e=>localStorage.removeItem("pairody-best:"+d+e)))}catch(e){}
