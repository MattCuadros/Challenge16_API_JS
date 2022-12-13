const inptCLP = document.querySelector("#inptCLP");
const slctCurrencies = document.querySelector("#slctCurrencies");
const btnSearch = document.querySelector("#btnSearch");
const resultHTML = document.querySelector("#resultHTML");
const canvaChart=document.querySelector("#canvaChart");
let arrayCurrencies = [];
let dataGraphic=[];
let arrayLabels=[];
let arrayDates=[];
let idCurrencies;
let myChart;

async function getMoney() {
    try {
        const data = await fetch("https://mindicador.cl/api/");
        const moneys = await data.json();
        for (const money in moneys) {
            if (
                moneys[money].unidad_medida === "Pesos" ||
                moneys[money].unidad_medida === "Dólar"
            ) {
                arrayCurrencies.push({
                    Name: moneys[money].nombre,
                    Value: moneys[money].valor,
                    Code: moneys[money].codigo
                });
            }
        }

    }
    catch{
        alert(error);
        

    }
}

async function renderCurrencies() {
  await getMoney();
  let opts = '<option value="" selected hidden>Seleccione Moneda</option>';
  arrayCurrencies.forEach((moneda) => {
    opts += `<option id="${moneda.Code}" value="${moneda.Value}">${moneda.Name}:$${moneda.Value}</option>`;
    return opts;
  });
  slctCurrencies.innerHTML = opts;

}
renderCurrencies();

btnSearch.addEventListener("click", () => { 
  let currencyValue = Number(slctCurrencies.value);
  idCurrencies=arrayCurrencies.find((money)=>{return (money.Value===currencyValue)})
  let subTotal = inptCLP.value / currencyValue;
  resultHTML.innerHTML = `Resultado:$${subTotal.toLocaleString()}`;
  console.log(idCurrencies.Code);
  dataForGraphicsRender();
  renderGraphic();
});

async function dataForGraphicsRender(){
    const data=await fetch(`https://mindicador.cl/api/${idCurrencies.Code}`);
    const result=await data.json();
    console.log("Datos de la respuesta", result);
    console.log(result["serie"]);
    arraySerie=result["serie"];
    arraySerie=arraySerie.slice(0,10);
    arrayLabels= arraySerie.map(({fecha,valor})=>{return (fecha).slice(0,10)});
    arrayValues= arraySerie.map(({fecha,valor})=>{return (valor)});
    console.log(arrayValues);
    arrayValues=arrayValues.reverse();
    arrayDates=arrayLabels.reverse();
    return arrayDates,arrayValues;
}



async function renderGraphic() {
    if(myChart){
       myChart.destroy(); 
    }
       
    await dataForGraphicsRender();
  myChart=new Chart(canvaChart, {
    type: "line",
    data: {
      labels: arrayDates,
      datasets: [
        {
          label: [`Valor Últimos 10 períodos del ${idCurrencies.Name}`],
          data: arrayValues,
        },
      ],
    },
  });
}
