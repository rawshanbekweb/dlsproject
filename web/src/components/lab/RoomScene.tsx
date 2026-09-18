import { relationLabels, roomObjects, type Anchor, type ObjectId, type Placement } from "@/lib/lab-content";
const anchors: Record<Anchor, [number, number]> = { table: [385, 265], window: [150, 125], shelf: [640, 160] };
const initial: Record<ObjectId, [number, number]> = { "red-chair": [135, 335], "blue-chair": [230, 335], "green-plant": [600, 335], "red-book": [695, 345] };
function position(placement: Placement): [number, number] {
  const [x] = anchors[placement.anchor];
  const surface = { table: 260, window: 184, shelf: 166 }[placement.anchor];
  switch (placement.relation) {
    case "left": return [x - 115, 335];
    case "right": return [x + 115, 335];
    case "under": return [x, 335];
    case "on": return [x, surface - 13];
    case "near": return [x + 100, 335];
  }
}
export function RoomScene({ placements, target, complete }: { placements: Partial<Record<ObjectId, Placement>>; target: Placement; complete: boolean }) {
  const [targetX, targetY] = position(target);
  return <div className="lab-room-scene"><svg viewBox="0 0 820 440" role="img" aria-label="Interaktiv xona. Buyumlarning hozirgi joyi quyidagi ro‘yxatda ham yozilgan.">
    <rect width="820" height="440" rx="22" fill="#f2f8fb" /><path d="M0 290h820v150H0z" fill="#e3edf2" /><path d="M0 290h820M0 370h820M80 290 0 440M300 290l-30 150M520 290l30 150M740 290l80 150" stroke="#cedee7" fill="none" />
    <rect x="85" y="42" width="130" height="142" rx="10" fill="#fff" stroke="#b9d3e1" strokeWidth="7" /><rect x="96" y="54" width="108" height="118" rx="3" fill="#d1edf5" /><circle cx="175" cy="80" r="16" fill="#fff1bc" /><path d="M150 51v124M96 115h108" stroke="white" strokeWidth="7" /><text x="150" y="213" textAnchor="middle" fill="#596f7d" fontSize="15">window</text>
    <path d="M568 166h144M580 171v19M700 171v19" stroke="#a8b5c8" strokeWidth="12" strokeLinecap="round" /><text x="640" y="222" textAnchor="middle" fill="#596f7d" fontSize="15">shelf</text>
    <path d="M316 273v72M454 273v72" stroke="#a49abb" strokeWidth="12" strokeLinecap="round" /><rect x="300" y="260" width="170" height="20" rx="7" fill="#c5b8df" /><text x="385" y="378" textAnchor="middle" fill="#596f7d" fontSize="15">table</text>
    {!complete && <g><ellipse cx={targetX} cy={targetY + 5} rx="39" ry="18" fill="#e9e3fc" stroke="#9b82df" strokeWidth="2" strokeDasharray="5 5" /><text x={targetX} y={targetY + 42} textAnchor="middle" fontSize="12" fill="#7357b5">maqsad</text></g>}
    {roomObjects.map((object) => {
      const [x, y] = placements[object.id] ? position(placements[object.id]!) : initial[object.id];
      return <g key={object.id} className="lab-room-object" style={{ transform: `translate(${x}px, ${y}px)` }}><title>{object.label}</title><ellipse cy="12" rx="29" ry="8" fill="#667788" opacity=".12" />
        {object.noun === "chair" ? <g stroke={object.color === "red" ? "#d97983" : "#5b9dc4"} strokeWidth="7" strokeLinecap="round"><path d="M-20 5v-37q0-6 6-6h28q6 0 6 6V5" fill={object.color === "red" ? "#f3b4b7" : "#a4d6ef"} /><path d="M-23-3h46M-19 0v15M19 0v15" /></g> : object.noun === "plant" ? <><path d="M0-15v-42" stroke="#528e73" strokeWidth="5" /><path d="M0-26q-30 0-21-23 22 2 21 23M0-36q25-24 29-1-7 13-29 1" fill="#77b69c" /><path d="M-19-13h38l-6 26h-26z" fill="#e1ab83" /></> : <g transform="rotate(-8)"><rect x="-25" y="-15" width="50" height="27" rx="4" fill="#d87889" /><path d="M-18-12v20M-12 8h32" stroke="#ffe9e7" strokeWidth="3" /></g>}
      </g>;
    })}
  </svg><div className="lab-room-caption"><span><i /> {complete ? "Ko‘rsatma aniq. Vazifa bajarildi!" : "Nuqtali belgi — vazifadagi kerakli joy."}</span><span>Nomining xonasi</span></div>
    <ul className="sr-only">{roomObjects.map((object) => { const p = placements[object.id]; return <li key={object.id}>{object.label}: {p ? `${relationLabels[p.relation]} the ${p.anchor}` : "boshlang‘ich joyida"}</li>; })}</ul>
  </div>;
}
