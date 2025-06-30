import Map from "https://js.arcgis.com/4.30/@arcgis/core/Map.js";
import MapView from "https://js.arcgis.com/4.30/@arcgis/core/views/MapView.js";
import BasemapToggle from "https://js.arcgis.com/4.30/@arcgis/core/widgets/BasemapToggle.js";
import Home from "https://js.arcgis.com/4.30/@arcgis/core/widgets/Home.js";
import Locate from "https://js.arcgis.com/4.30/@arcgis/core/widgets/Locate.js";
import Compass from "https://js.arcgis.com/4.30/@arcgis/core/widgets/Compass.js";
import Zoom from "https://js.arcgis.com/4.30/@arcgis/core/widgets/Zoom.js";
import LayerList from "https://js.arcgis.com/4.30/@arcgis/core/widgets/LayerList.js";
import Legend from "https://js.arcgis.com/4.30/@arcgis/core/widgets/Legend.js";
import Expand from "https://js.arcgis.com/4.30/@arcgis/core/widgets/Expand.js";
import FeatureLayer from "https://js.arcgis.com/4.30/@arcgis/core/layers/FeatureLayer.js";
import MapImageLayer from "https://js.arcgis.com/4.30/@arcgis/core/layers/MapImageLayer.js";
import WMSLayer from "https://js.arcgis.com/4.30/@arcgis/core/layers/WMSLayer.js";
import Query from "https://js.arcgis.com/4.30/@arcgis/core/rest/support/Query.js";
import FeatureTable from "https://js.arcgis.com/4.30/@arcgis/core/widgets/FeatureTable.js";
import Print from "https://js.arcgis.com/4.30/@arcgis/core/widgets/Print.js";
import Search from "https://js.arcgis.com/4.30/@arcgis/core/widgets/Search.js";
import Measurement from "https://js.arcgis.com/4.30/@arcgis/core/widgets/Measurement.js";
import OverviewMap from "https://js.arcgis.com/4.30/@arcgis/core/widgets/OverviewMap.js";

const map = new Map({
  basemap: "streets"
});

const view = new MapView({
  container: "mapDiv",
  map: map,
  center: [-95, 40],
  zoom: 4
});

const basemapToggle = new BasemapToggle({
  view: view,
  nextBasemap: "satellite"
});

const home = new Home({ view });
const locate = new Locate({ view });
const compass = new Compass({ view });
const zoom = new Zoom({ view });

view.ui.add([home, locate, compass, zoom, basemapToggle], "top-left");

const featureLayer = new FeatureLayer({
  url: "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/ArcGIS/rest/services/USA_Major_2016/FeatureServer/0",
  title: "Major Cities"
});

const mapImageLayer = new MapImageLayer({
  url: "https://sampleserver6.arcgisonline.com/arcgis/rest/services/Census/MapServer",
  title: "Census Map",
  minScale: 72223.819286
});

const wmsLayer = new WMSLayer({
  url: "https://ahocevar.com/geoserver/wms",
  sublayers: [{ name: "topp:states" }],
  title: "WMS States"
});

map.addMany([mapImageLayer, featureLayer, wmsLayer]);

const layerList = new LayerList({ view });
const legend = new Legend({ view });

const layerListExpand = new Expand({
  view,
  content: layerList,
  expanded: true,
  expandIconClass: "esri-icon-layer-list"
});

const legendExpand = new Expand({
  view,
  content: legend,
  expandIconClass: "esri-icon-documentation"
});

view.ui.add([layerListExpand, legendExpand], "top-right");

const featureTable = new FeatureTable({
  view: view,
  layer: featureLayer,
  container: document.getElementById("feature-table")
});

const printWidget = new Print({
  view: view,
  container: document.getElementById("print"),
  printServiceUrl:
    "https://utility.arcgisonline.com/ArcGIS/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task"
});

const searchWidget = new Search({ view });
const measurementWidget = new Measurement({ view });
const overviewMap = new OverviewMap({ view });

view.ui.add(searchWidget, "top-right");
view.ui.add(measurementWidget, "bottom-right");
view.ui.add(overviewMap, "bottom-left");

// Query panel
const queryToggle = document.getElementById("query-toggle");
const rightPanel = document.getElementById("right-panel");
queryToggle.addEventListener("click", () => {
  rightPanel.classList.toggle("collapsed");
});

const layerSelect = document.getElementById("layerSelect");
const fieldSelect = document.getElementById("fieldSelect");
const valueInput = document.getElementById("valueInput");

view.when(() => {
  map.layers.forEach((layer) => {
    if (layer.type === "feature") {
      const option = document.createElement("option");
      option.value = layer.id;
      option.textContent = layer.title;
      layerSelect.appendChild(option);
    }
  });
  if (layerSelect.options.length) {
    layerSelect.value = layerSelect.options[0].value;
    populateFields();
  }
});

layerSelect.addEventListener("change", populateFields);

function populateFields() {
  const layer = map.layers.find((l) => l.id === layerSelect.value);
  fieldSelect.innerHTML = "";
  if (layer && layer.fields) {
    layer.fields.forEach((f) => {
      const opt = document.createElement("option");
      opt.value = f.name;
      opt.textContent = f.alias;
      fieldSelect.appendChild(opt);
    });
  }
}

document.getElementById("applyFilter").addEventListener("click", () => {
  const layer = map.layers.find((l) => l.id === layerSelect.value);
  if (!layer) return;
  const where = `${fieldSelect.value} = '${valueInput.value}'`;
  document.getElementById("loading").classList.remove("hidden");
  layer.definitionExpression = where;
  layer.load().then(() => {
    featureTable.layer = layer;
    featureTable.refresh();
  }).finally(() => {
    document.getElementById("loading").classList.add("hidden");
  });
});

document.getElementById("measure-btn").addEventListener("click", () => {
  measurementWidget.activeTool =
    measurementWidget.activeTool === "distance" ? null : "distance";
});

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function exportLayer(layer) {
  return layer.queryFeatures().then((result) => result.features);
}

document.getElementById("export-geojson").addEventListener("click", () => {
  exportLayer(featureLayer).then((features) => {
    const data = features.map((f) => f.toJSON());
    const blob = new Blob([
      JSON.stringify({ type: "FeatureCollection", features: data })
    ], { type: "application/geo+json" });
    downloadBlob(blob, "export.geojson");
  });
});

document.getElementById("export-csv").addEventListener("click", () => {
  exportLayer(featureLayer).then((features) => {
    const fields = featureLayer.fields.map((f) => f.name);
    const header = fields.join(",");
    const rows = features.map((f) =>
      fields.map((fld) => f.attributes[fld]).join(",")
    );
    const blob = new Blob([header + "\n" + rows.join("\n")], {
      type: "text/csv"
    });
    downloadBlob(blob, "export.csv");
  });
});

const langButtons = [
  document.getElementById("lang-en"),
  document.getElementById("lang-ar")
];
langButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const isAr = btn.id === "lang-ar";
    document.documentElement.dir = isAr ? "rtl" : "ltr";
    langButtons.forEach((b) => b.classList.toggle("active", b === btn));
  });
});
