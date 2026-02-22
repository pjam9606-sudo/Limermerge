
let minersData = [];
let currentPower = 0;

fetch('Miners.json')
  .then(res => res.json())
  .then(data => minersData = data);

const input = document.getElementById('minerID');
const suggestions = document.getElementById('suggestions');
const priceInput = document.getElementById("lmt-price");

// Ratio simple (lvl1)
function updateMinerRatio(power) {
  const price = Number(priceInput.value) || 0;
  const ratio = price > 0 ? (power / price) : 0;
  document.getElementById("lmt-ratio").textContent = ratio.toFixed(2);
}

function fillTable(miner) {

  const basePower = Number(miner.Power) || 0;
  currentPower = basePower;

  document.getElementById("miner-img").src = miner.img;
  document.getElementById("miner-power").textContent = basePower + " Th/s";
  document.getElementById("miner-cells").textContent = miner.Cells || 0;

  updateMinerRatio(basePower);

  // Precios de partes
  const precios = {
    L1: 0,
    L2: 0.025,
    L3: 0.5,
    L4: 7.55,
    L5: 88.4
  };

  // 🔑 costo inicial del minero (usuario)
  let finalCostPrev = Number(priceInput.value) || 0;

  for (let level = 2; level <= 6; level++) {

    const lvlData = miner.Levels[level.toString()] || {};

    const HL = Number(lvlData[`HL${level - 1}`] || 0);
    const CL = Number(lvlData[`CL${level - 1}`] || 0);
    const PUL = Number(lvlData[`PUL${level - 1}`] || 0);
    const FEEL = Number(lvlData.FEEL || 0);
    const PLV = Number(lvlData.PLV || 0); // 🔥 POWER REAL DEL NIVEL

    // Mostrar datos
    document.getElementById(`HL${level - 1}`).textContent = HL;
    document.getElementById(`CL${level - 1}`).textContent = CL;
    document.getElementById(`PUL${level - 1}`).textContent = PUL;
    document.getElementById(`FEEL${level}`).textContent = FEEL + " LMT";
    document.getElementById(`PLV${level}`).textContent = PLV + " Th/s";

    // Costos de partes
    const precioNivel = precios[`L${level - 1}`] || 0;
    const costHL = HL * precioNivel;
    const costCL = CL * precioNivel;
    const costPUL = PUL * precioNivel;

    document.getElementById(`costHL${level - 1}`).textContent = costHL.toFixed(2) + " LMT";
    document.getElementById(`costCL${level - 1}`).textContent = costCL.toFixed(2) + " LMT";
    document.getElementById(`costPUL${level - 1}`).textContent = costPUL.toFixed(2) + " LMT";

    // Fee + Parts
    const partsCost = costHL + costCL + costPUL;
    const levelCost = FEEL + partsCost;

    document.getElementById(`F+P${level}`).textContent = levelCost.toFixed(2) + " LMT";

    // 🔥 FINAL COST CORRECTO (MERGES)
    const finalCost = (finalCostPrev * 2) + levelCost;

    document.getElementById(`FC${level}`).textContent = finalCost.toFixed(2) + " LMT";

    // ✅ RATIO CORRECTO → POWER DEL NIVEL / COSTO FINAL
    const ratio = finalCost > 0 ? (PLV / finalCost) : 0;
    document.getElementById(`R${level}`).textContent = ratio.toFixed(2);

    finalCostPrev = finalCost;
  }
}

// Recalcular al cambiar precio del minero
priceInput.addEventListener("input", () => {
  updateMinerRatio(currentPower);

  if (input.value) {
    const miner = minersData.find(m => m.MINER === input.value);
    if (miner) fillTable(miner);
  }
});

// Buscador
input.addEventListener('input', () => {
  const q = input.value.toLowerCase();
  suggestions.innerHTML = '';
  if (!q) return;

  minersData
    .filter(m => m.MINER.toLowerCase().includes(q))
    .forEach(miner => {
      const div = document.createElement('div');
      div.className = 'suggestion-item';
      div.innerHTML = `<img src="${miner.img}"><span>${miner.MINER}</span>`;
      div.onclick = () => {
        input.value = miner.MINER;
        suggestions.innerHTML = '';
        fillTable(miner);
      };
      suggestions.appendChild(div);
    });
});

document.addEventListener('click', e => {
  if (e.target !== input) suggestions.innerHTML = '';
});

