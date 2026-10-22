// Quiet, static environments shared by the game and the parent gallery.
const groups = {
  forest: ['boar','eagle','stag','deer','moose','fox','bear','squirrel','hedgehog','owl','badger','wolf','raccoon','woodpecker','bat'],
  farm: ['pig','donkey','alpaca','cow','goat','horse','foal','sheep','goose','turkey','rooster','hen'],
  meadow: ['ant','wasp','sparrow','stork','rabbit','butterfly','cicada','moth','ladybug','bee','fly','snail','mouse'],
  savanna: ['rhino','antelope','cheetah','hyena','lion','elephant','giraffe','zebra','meerkat'],
  jungle: ['gorilla','lizard','panther','jaguar','tapir','toucan','monkey','tiger','parrot','sloth','chameleon','peacock'],
  bamboo: ['panda'],
  desert: ['camel'],
  ocean: ['lobster','dolphin','whale','orca','shark','octopus','fish','seahorse','jellyfish'],
  shore: ['seal','seaLion','crab'],
  polar: ['penguin','polarBear'],
  pond: ['frog','duck','swan','flamingo','turtle','hippo','crocodile'],
  river: ['platypus','beaver','otter','crayfish'],
  outback: ['emu','kangaroo','koala'],
  home: ['ferret','cat','dog','hamster'],
  garden: ['mole','pigeon','spider','caterpillar','snake'],
};
const labels = { desert:'Na pustyni', forest:'W lesie', farm:'Na farmie', meadow:'Na łące', savanna:'Na sawannie', jungle:'W dżungli', bamboo:'W bambusowym lesie', ocean:'W oceanie', shore:'Nad morzem', polar:'W krainie lodu', pond:'Nad stawem', river:'Nad rzeką', outback:'W Australii', home:'W domu', garden:'W ogrodzie' };
export function habitatFor(animal) {
  const entry = Object.entries(groups).find(([, kinds]) => kinds.includes(animal.kind));
  if (!entry) throw new Error(`Brak scenerii: ${animal.kind}`);
  return { id: entry[0], label: labels[entry[0]] };
}
const p = (d, fill) => `<path d="${d}" fill="${fill}"/>`;
const e = (x,y,rx,ry,c) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${c}"/>`;
const stroke = (d,c,w=3) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`;
const tree = (x,y,s=1) => `<g transform="translate(${x} ${y}) scale(${s})">${p('M-4 0H5L8 114H-7Z','#8b795b')}${e(0,15,30,39,'#88ac86')}${e(-17,41,24,31,'#7a9e77')}${e(17,38,23,32,'#8aaf82')}</g>`;
const grass = (x,y,c='#8fa571') => stroke(`M${x} ${y}l-8-18m8 18 3-24m-3 24 12-13`,c,3);
const reed = (x,y) => stroke(`M${x} ${y}v-68m0 50q-17-32-24-28m24 37q17-34 24-29`,'#6f956d',3)+stroke(`M${x} ${y-67}v-16`,'#a48250',6);
const palettes = {
  desert:['#d8cbb2','#cfb17f'],
  forest:['#c7d6c4','#acbe8d'], farm:['#ccd9ca','#b8c68d'], meadow:['#cdd9c3','#bfcb94'],
  savanna:['#d8cba7','#cdb77b'], jungle:['#c2d4c3','#a8c091'], bamboo:['#cbd7bd','#b3c493'],
  ocean:['#bdd4d5','#a7c5ca'], shore:['#c3d5d5','#d0c2a2'], polar:['#becfd5','#d4dfd8'],
  pond:['#c8d6bc','#b3c69b'], river:['#c3d2bf','#b2c29a'], outback:['#d6cbb0','#ccad89'],
  home:['#d6cbb8','#c6af94'], garden:['#cbd5be','#b4c294'],
};
export function habitatArt(animal) {
  const {id} = habitatFor(animal), [sky, ground] = palettes[id];
  let art = `<rect width="370" height="270" rx="24" fill="${sky}"/>`;
  art += p('M0 199Q83 178 164 198T370 190V270H0Z',ground);
  if (['forest','jungle','outback'].includes(id)) {
    art += tree(29,29,.95) + tree(342,50,.8);
    if (id === 'jungle') art += stroke('M0 18Q53 68 100 12M271 0Q302 73 370 35','#83a381',4);
    if (id === 'outback') art += e(38,41,35,15,'#9fb39a') + e(330,56,36,15,'#9fb39a');
    art += grass(35,242)+grass(337,238);
  } else if (id === 'savanna') {
    art += e(309,43,19,19,'#e5c77e') + stroke('M47 184L50 105L28 77M50 121L77 92','#9c885c',6);
    art += e(46,78,44,13,'#a5b17a')+e(72,88,28,10,'#a5b17a')+grass(26,239,'#b99f60')+grass(332,234,'#b99f60');
  } else if (id === 'desert') {
    art += e(307,44,20,20,'#e6c37d');
    art += p('M0 187Q67 132 148 183T370 172V270H0Z','#d6bc93');
    art += p('M0 224Q104 193 205 225T370 215V270H0Z','#c7a774');
    art += grass(28,245,'#aa905e')+grass(337,238,'#aa905e')+e(312,250,10,4,'#b69a6a');
  } else if (id === 'farm') {
    art += p('M3 123H74V180H3Z','#bd8170')+p('M0 124L39 89L80 124Z','#886d5c')+p('M29 147H49V180H29Z','#f4e8cf');
    art += stroke('M284 174H370M284 191H370M291 161V207M329 161V207M364 161V207','#aa956e',4)+grass(31,243)+grass(337,238);
  } else if (id === 'bamboo') {
    for (const x of [17,39,329,351]) {
      art += stroke(`M${x} 204V16`,'#8da77b',7)+stroke(`M${x-4} 58h8m-8 47h8m-8 47h8`,'#647f5e',2);
      art += p(`M${x} 79q-27-28-28-8q12 15 28 8M${x} 122q26-25 29-11q-12 17-29 11`,'#83a477');
    }
  } else if (id === 'ocean') {
    art += stroke('M0 34Q30 23 62 34T127 34T192 34T257 34T322 34T387 34','#afd1d6',3);
    art += p('M0 245Q90 229 177 249T370 238V270H0Z','#e6d8b7');
    art += stroke('M24 253Q10 216 28 186M39 252Q55 214 39 198M335 249Q354 219 341 184','#83aaa0',6);
    art += e(38,90,5,5,'#f0f8f5')+e(325,118,7,7,'#f0f8f5')+e(336,98,3,3,'#f0f8f5');
  } else if (id === 'polar') {
    art += p('M0 181L47 120L98 181L128 156L168 191L270 177L311 130L370 174V219H0Z','#bed5df');
    art += p('M0 220Q89 200 185 222T370 212V270H0Z','#dce6dc')+stroke('M10 252h65m217-8h64','#b6d2dc',2);
  } else if (['pond','river','shore'].includes(id)) {
    art += p('M0 194Q75 204 145 193T370 192V254Q285 238 190 253T0 251Z','#b3d3d5');
    art += stroke('M4 216h44m260 6h54M22 237h38','#e8f2e5',2);
    if (id !== 'shore') art += reed(28,247)+reed(343,242)+e(62,229,17,5,'#8eae7b');
    else art += p('M8 249l8-8 9 7-8 8Z','#bd9f7d')+e(335,251,12,5,'#c4af8c');
  } else if (id === 'home') {
    art += p('M0 205H370V270H0Z','#c6af94')+stroke('M0 205H370','#bba589',3);
    art += '<rect x="20" y="35" width="58" height="70" rx="8" fill="#dfd9c6" stroke="#c7ae8a" stroke-width="4"/>';
    art += p('M26 41H72V99H26Z','#c5dfe0')+stroke('M49 41V99M26 70H72','#dfd9c6',4)+e(185,233,125,20,'#d4bba1');
    art += p('M316 182h27l-4 25h-19Z','#b68369')+stroke('M330 183v-35','#819776',4)+e(319,153,12,6,'#8ea680')+e(341,141,12,6,'#8ea680');
  } else {
    art += grass(25,239)+grass(338,242)+e(24,178,31,22,'#acc395')+e(351,178,26,20,'#acc395');
    for (const [x,y] of [[45,218],[323,224]]) art += stroke(`M${x} ${y+12}v-15`,'#8fa571',2)+e(x,y-5,7,6,'#d1b575')+e(x,y-5,2,2,'#f9edcc');
  }
  return `<g class="habitat" data-habitat="${id}">${art}</g>`;
}
