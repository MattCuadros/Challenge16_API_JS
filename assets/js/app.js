const loading = document.querySelector("#loading");
const inptUser = document.querySelector("#inptUser");
const slctMonedas = document.querySelector("#slctMonedas");
const btnBuscar = document.querySelector("#btnBuscar");
const resultadoHTML = document.querySelector("#resultadoHTML");
const canvaGrafico = document.querySelector("#canvaGrafico");

let arrayMonedas = [];
let datosGrafico = [];
let arrayEtiquetas = [];
let arrayFechas = [];
let idMonedas;
let myChart;
const url = "https://mindicador.cl/api/";

async function buscarMonedas(url) {
  try {
    loading.classList.remove("d-none");
    const res = await fetch(url);
    const data = await res.json();
    for (const money in data) {
      if (
        data[money].unidad_medida === "Pesos" 
      ) {
        arrayMonedas.push({
          Name: data[money].nombre,
          Value: data[money].valor,
          Code: data[money].codigo,
        });
      }
    }
  } catch {
    resultadoHTML.innerHTML = `No se encontró la API ${url}`;
    alert(error);
  } finally {
    loading.classList.add("d-none");
  }
}

async function render() {
  await buscarMonedas(url);
  let opts = '<option value="" selected hidden>Seleccione Moneda</option>';
  arrayMonedas.forEach((moneda) => {
    opts += `<option id="${moneda.Code}" value="${moneda.Value}">${moneda.Name}:$${moneda.Value}</option>`;
    return opts;
  });
  slctMonedas.innerHTML = opts;
}
render();

btnBuscar.addEventListener("click", () => {
  let valorMoneda = Number(slctMonedas.value);
  idMonedas = arrayMonedas.find((money) => {
    return money.Value === valorMoneda;
  });
  let subTotal = inptUser.value / valorMoneda;
  resultadoHTML.innerHTML = `Resultado:$${subTotal.toLocaleString()}`;
  datosParaGrafico();
  renderGrafico();
});

async function datosParaGrafico() {
  const data = await fetch(`https://mindicador.cl/api/${idMonedas.Code}`);
  const result = await data.json();
  arraySerie = result["serie"];
  arraySerie = arraySerie.slice(0, 10);
  arrayEtiquetas = arraySerie.map(({ fecha, valor }) => {
    return fecha.slice(0, 10);
  });
  arrayValores = arraySerie.map(({ fecha, valor }) => {
    return valor;
  });
  arrayValores = arrayValores.reverse();
  arrayFechas = arrayEtiquetas.reverse();
  return arrayFechas, arrayValores;
}

async function renderGrafico() {
  if (myChart) {
    myChart.destroy();
  }

  await datosParaGrafico();
  myChart = new Chart(canvaGrafico, {
    type: "line",
    data: {
      labels: arrayFechas,
      datasets: [
        {
          label: [`Valor Últimos 10 períodos del ${idMonedas.Name}`],
          data: arrayValores,
        },
      ],
    },
  });
}
