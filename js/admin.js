let urlGeoJson = "./geoJson/Territoires.kml";
let geoJson;
let isCom = 0;
let isInv = 0;
let first;
let coords;
let bounds;
let hoveredTerId = null;
let searchField = $("#search-field");
let kindSelector = $("#kind");
kindSelector.prop("selectedIndex", 0);
prepareGeoJson();

let map = new maplibregl.Map({
  container: "map",
  style: "./style-map/street.json",
  center: coords[0][0],
  trackResize: true,
  zoom: 18,
});
map.fitBounds(bounds, {
  padding: 20,
});
map.addControl(new maplibregl.NavigationControl());
map.on("load", onMapLoad);
setSearch();

function onMapLoad() {
  map.addSource("territoire", {
    type: "geojson",
    data: geoJson,
  });
  map.addLayer({
    id: "territoire-fills",
    type: "fill",
    source: "territoire",
    layout: {},
    paint: {
      "fill-color": "#627BC1",
      "fill-opacity": [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        1,
        0.5,
      ],
    },
  });
  map.addLayer({
    id: "territoire-borders",
    type: "line",
    source: "territoire",
    layout: {},
    paint: {
      "line-color": "#555555",
      "line-width": 2,
    },
  });
  map.addLayer({
    id: "territoire-numbers",
    type: "symbol",
    source: "territoire",
    layout: {
      "text-field": ["get", "number"],
      "text-justify": "center",
      "text-size": 14,
    },
  });
  map.on("mousemove", "territoire-fills", function (e) {
    if (e.features.length > 0) {
      if (hoveredTerId != null) {
        map.setFeatureState(
          { source: "territoire", id: hoveredTerId },
          { hover: false }
        );
      }
      hoveredTerId = e.features[0].properties.number;
      map.setFeatureState(
        { source: "territoire", id: hoveredTerId },
        { hover: true }
      );
    }
  });
  map.on("mouseleave", "territoire-fills", function () {
    if (hoveredTerId != null) {
      map.setFeatureState(
        { source: "territoire", id: hoveredTerId },
        { hover: false }
      );
    }
    hoveredTerId = null;
  });

  map.on("click", "territoire-fills", function (e) {
    let number = String(parseInt(e.features[0].properties.number));
    let filename = number;
    if (isCom) {
      filename = "Commerces - " + number;
    }
    if (isInv) {
      filename = "Campagne - " + number;
    }
    let t = e.features[0];
    let urlTerr =
      window.location.origin + "/?n=" + number + "&c=" + isCom + "&i=" + isInv;
    new maplibregl.Popup()
      .setLngLat(e.lngLat)
      .setHTML(
        `
                <h5 class="text-center">${e.features[0].properties.name}</h5>
                <ul class="nav justify-content-center">
                    <li class="nav-item">
                        <a class="nav-link" href="${urlTerr}" target="_blank">
                            <i class="bi bi-aspect-ratio" style="font-size: 2rem; color: darkslategrey;"></i>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a id="pdfLink" onclick="pdf('${number}')" class="nav-link" href="javascript:void(0);">
                            <i class="bi bi-filetype-pdf" style="font-size: 2rem; color: darkslategrey;"></i>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a id="copyLink" onclick="copyLink('${urlTerr}')" class="nav-link" href="javascript:void(0);">
                            <span class="" id="myTooltip"></span>
                            <i class="bi bi-link-45deg" style="font-size: 2rem; color: darkslategrey;"></i>
                        </a>
                    </li>
                </ul>
            `
      )
      .addTo(map);
  });

  map.on("mouseenter", "territoire-fills", function () {
    map.getCanvas().style.cursor = "pointer";
  });

  map.on("mouseleave", "territoire-fills", function () {
    map.getCanvas().style.cursor = "";
  });

  kindSelector.change(function (event) {
    let kind = event.target.value;
    switch (kind) {
      case "particuliers":
        urlGeoJson = "./geoJson/Territoires.kml";
        isCom = 0;
        isInv = 0;
        break;
      case "commerces":
        isCom = 1;
        isInv = 0;
        urlGeoJson = "./geoJson/Commerces.kml";
        break;
      case "campagnes":
        isCom = 0;
        isInv = 1;
        urlGeoJson = "./geoJson/Campagnes.kml";
        break;
    }
    if (map.getLayer("territoire-fills")) map.removeLayer("territoire-fills");
    if (map.getLayer("territoire-borders"))
      map.removeLayer("territoire-borders");
    if (map.getLayer("territoire-numbers"))
      map.removeLayer("territoire-numbers");
    if (map.getSource("territoire")) map.removeSource("territoire");
    if (map.getLayer("territoire-found-border"))
      map.removeLayer("territoire-found-border");
    if (map.getSource("territoire-found")) map.removeSource("territoire-found");

    prepareGeoJson();
    map.fitBounds(bounds, {
      padding: 20,
    });
    onMapLoad();
  });
}

function setSearch() {
  searchField.val("");
  $("#button-search").click(function () {
    let feat = geoJson.features[parseInt($("#search-field").val()) - 1];
    if (map.getLayer("territoire-found-border"))
      map.removeLayer("territoire-found-border");
    if (map.getSource("territoire-found")) map.removeSource("territoire-found");
    if (!feat) {
      map.fitBounds(bounds, {
        padding: 20,
      });
      return;
    }
    map.addSource("territoire-found", {
      type: "geojson",
      data: feat,
    });
    map.addLayer({
      id: "territoire-found-border",
      type: "line",
      source: "territoire-found",
      layout: {},
      paint: {
        "line-color": "yellow",
        "line-width": 3,
      },
    });
    let featCoords = feat.geometry.coordinates;
    let featBounds = featCoords[0].reduce(function (featBounds, coordinate) {
      return featBounds.extend(coordinate);
    }, new maplibregl.LngLatBounds(featCoords[0][0], featCoords[0][0]));
    map.fitBounds(featBounds, {
      padding: 100,
    });
  });
  searchField.on("keypress", function (e) {
    if (e.which === 13) {
      $("#button-search").click();
    }
  });
}

function copyLink(url) {
  navigator.clipboard.writeText(url);
  $("#myTooltip").html("Copié");
  $("#myTooltip").addClass("tooltiptext");
}

function CSVToJSON(data, delimiter = ";") {
  const titles = data.slice(0, data.indexOf("\n")).split(delimiter);
  return data
    .slice(data.indexOf("\n") + 1)
    .split("\n")
    .map((v) => {
      const values = v.split(delimiter);
      return titles.reduce(
        (obj, title, index) => ((obj[title] = values[index]), obj),
        {}
      );
    });
}

function prepareGeoJson() {
  searchField.val("");
  $.ajax({
    url: urlGeoJson,
    async: false,
  }).done(function (xml) {
    geoJson = toGeoJSON.kml(xml);
  });
  first = geoJson.features.shift();
  coords = first.geometry.coordinates;
  bounds = coords[0].reduce(function (bounds, coordinate) {
    return bounds.extend(coordinate);
  }, new maplibregl.LngLatBounds(coords[0][0], coords[0][0]));

  hoveredTerId = null;
}

async function pdf(n) {
  let ts;
  if (n === 0) {
    ts = geoJson.features;
  } else {
    ts = [geoJson.features[n - 1]];
  }
  for (let i in ts) {
    window.jsPDF = window.jspdf.jsPDF;
    let doc = new jsPDF({
      orientation: "portrait",
      unit: "cm",
      format: [14.5, 18.5],
    });
    let t = ts[i];
    let number = t["properties"]["number"];
    // let desc = t['properties']['description'];
    let urlTerr =
      window.location.origin + "/?n=" + number + "&c=" + isCom + "&i=" + isInv;
    const width = 14.5;
    const height = 18.5;
    const margin = 0.3;
    let zone = "Porte à porte";
    let name = number;
    if (isCom) {
      zone = "Commerces";
      name = "Commerces - " + number;
    }
    if (isInv) {
      zone = "Campagne";
      name = "Campagne - " + number;
    }
    let comment =
      "Tu peux en savoir plus sur les adresses de ce territoire \nen allant sur place ou depuis des sites internets comme \nopenstreetmap.org, geoportail.gouv.fr ou";
    let note = t["properties"]["infos"];
    let info = "Informations :";
    let npv =
      "Personnes ne souhaitant pas être visitées :\n(adresses et dates seulement)\n";

    doc.setLineWidth(0.03);
    doc.rect(0, 0, width, height);

    // Titre
    doc.setFont("helvetica", "normal");
    doc.setFontSize(14);
    doc.text("N°" + number.toString() + " - " + zone, margin, margin + 0.4);

    // Légende
    doc.setFontSize(10);
    doc.setDrawColor("#717e96");
    doc.setLineWidth(0.05);
    doc.setFillColor("#4a86e8");
    doc.rect(width - margin - 0.8, margin, 0.8, 0.4, "FD");
    doc.setFillColor("#000");
    doc.text("Zone à travailler", width - margin - 3.6, margin + 0.4);

    // Image
    let w = parseInt(width);
    let h = parseInt(height / 2 - 5 * margin);
    let dim = 720;
    let values = {};
    let features = [t];
    features[0]["properties"] = {
      fill: "#4A86E8",
      "fill-opacity": 0.5,
      stroke: "#000",
      "stroke-width": 2,
      "stroke-opacity": 0.6,
    };
    values["overlay"] = JSON.stringify(features);

    let urlImg =
      "https://api.mapbox.com/styles/v1/romaindamiano/ckbxylhbh2gnt1hqudcjxl7a9/static/geojson(%7B%22type%22%3A%22FeatureCollection%22%2C%22features%22%3A{overlay}%7D)/auto/" +
      dim.toString() +
      "x" +
      parseInt((h * dim) / w).toString() +
      "?padding=20&access_token=pk.eyJ1Ijoicm9tYWluZGFtaWFubyIsImEiOiJja2J3bmxkcW4wMmllMzBzNXVudnVqYWo3In0.GTCn7CUNaTGQbNB7iXPu-w";
    urlImg = URITemplate(urlImg).expand(values);
    let img;
    const mapBlob = await $.ajax({
      url: urlImg,
      xhrFields: {
        responseType: "blob",
      },
    });
    const url = window.URL || window.webkitURL;
    img = url.createObjectURL(mapBlob);
    doc.addImage(
      img,
      margin,
      2 * margin + 0.4,
      width - 2 * margin,
      height / 2 - 3 * margin - 0.4
    );
    doc.rect(
      margin,
      2 * margin + 0.4,
      width - 2 * margin,
      height / 2 - 3 * margin - 0.4
    );

    // Ligne pliage
    doc.setLineDash([0.2, 0.1]);
    doc.line(margin, height / 2, width - margin, height / 2);

    // Comment
    var textLines = doc
      .setFont("helvetica")
      .setFontSize(10)
      .splitTextToSize(comment, (width * 3) / 4);
    doc.text(textLines, 2 * margin, height / 2 + 3 * margin);
    doc.setFont("helvetica", "bold");
    doc.text(
      "en cliquant ici -->",
      2 * margin + 6.53,
      height / 2 + 6 * margin - 0.1
    );
    doc.setFont("helvetica");
    doc.setFontSize(8);

    let icon;
    const iconBlob = await $.ajax({
      url: "./img/osm.png",
      xhrFields: {
        responseType: "blob",
      },
    });

    const urlIcon = window.URL || window.webkitURL;
    icon = urlIcon.createObjectURL(iconBlob);
    doc.addImage(
      icon,
      "PNG",
      (width * 5) / 6 - 0.75,
      height / 2 + 2 * margin,
      1.5,
      1.5
    );
    doc.link((width * 5) / 6 - 0.75, height / 2 + 2 * margin, 1.5, 1.5, {
      url: urlTerr,
    });

    doc.setLineDash([0.1, 0.05]);
    doc.line(
      width / 2 - 4 * margin,
      (height * 4) / 6,
      width / 2 - 4 * margin,
      height - 4 * margin
    );

    doc.setLineDash([1, 0]);
    var textInfo = doc
      .setFont("helvetica", "normal")
      .setFontSize(10)
      .splitTextToSize(note, (width * 1) / 3);

    doc.text(info, 2 * margin, (height * 4) / 6 + 0.4);
    doc.line(
      2 * margin,
      (height * 4) / 6 + 0.5,
      2 * margin + 2.1,
      (height * 4) / 6 + 0.5
    );
    doc.text(npv, width / 2 - 2 * margin, (height * 4) / 6 + 0.4);
    doc.line(
      width / 2 - 2 * margin,
      (height * 4) / 6 + 0.5,
      width - 3 * margin - 0.2,
      (height * 4) / 6 + 0.5
    );

    doc.setFontSize(9);
    doc.text(textInfo, 2 * margin, (height * 4) / 6 + 1.5);

    let npvTxt = "";
    const panvpData = await $.get("geoJson/PANPV.csv");
    let json = CSVToJSON(panvpData);
    for (let i = 0; i < json.length; i++) {
      let obj = json[i];
      let num;
      if (isCom) {
        num = obj["Commerces"];
      } else if (isInv) {
        num = obj["Campagnes"];
      } else {
        num = obj["Territoires"];
      }
      if (parseInt(num) === parseInt(number)) {
        let addresse = obj["Adresse"];
        let date = obj["Date"].replace(/\s+/g, " ").trim();
        if (date != "") {
          addresse += " - ";
        }
        npvTxt += addresse + date + "\n";
      }
    }
    doc.text(npvTxt, width / 2 - 2 * margin, (height * 4) / 6 + 1.5);

    doc.setFont("helvetica");
    doc.setFontSize(7);
    doc.text(
      "Lorsque tu as fini de travailler le territoire, si tu as la version électronique, merci de la supprimer.",
      6 * margin,
      height - 2 * margin
    );

    doc.save(name + ".pdf");
  }
}
