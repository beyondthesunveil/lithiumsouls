(function () {
  "use strict";

  var rotatingLinks = [
    {
      name: "12-093",
      url: "https://lithium-souls.forumactif.com/t207-anomalies-2-3#846",
      image: "https://i.pinimg.com/1200x/8a/1a/dc/8a1adcc433945321c0d8a03a54f07993.jpg",
      accent: "#d6bd88",
      position: "center"
    },
    {
      name: "Zolaus",
      url: "https://lithium-souls.forumactif.com/t207-anomalies-2-3#847",
      image: "https://i.pinimg.com/736x/16/73/d7/1673d7523c029373761e942adfe08619.jpg",
      accent: "#a38f9e",
      position: "center"
    },
    {
      name: "Leeway",
      url: "https://lithium-souls.forumactif.com/t119-benriya-%E4%BE%BF%E5%88%A9%E5%B1%8B-7-7#482",
      image: "https://i.pinimg.com/1200x/59/5f/4b/595f4b16b85651c712f35fa8cc004207.jpg",
      accent: "#bb7269",
      position: "center"
    },
    {
      name: "Luff",
      url: "https://lithium-souls.forumactif.com/t119-benriya-%E4%BE%BF%E5%88%A9%E5%B1%8B-7-7#483",
      image: "https://i.pinimg.com/736x/d3/7c/85/d37c8583846996723c7ec4e3f04e8494.jpg",
      accent: "#6f978f",
      position: "center"
    },
    {
      name: "Kedge",
      url: "https://lithium-souls.forumactif.com/t119-benriya-%E4%BE%BF%E5%88%A9%E5%B1%8B-7-7#484",
      image: "https://zupimages.net/up/26/23/63zo.png",
      accent: "#947f9a",
      position: "center"
    },
    {
      name: "Meridian",
      url: "https://lithium-souls.forumactif.com/t119-benriya-%E4%BE%BF%E5%88%A9%E5%B1%8B-7-7#485",
      image: "https://i.pinimg.com/736x/15/47/40/15474048a3258e0b5dfbeaf03f02e2ef.jpg",
      accent: "#ac9e72",
      position: "center"
    },
    {
      name: "Mizzen",
      url: "https://lithium-souls.forumactif.com/t119-benriya-%E4%BE%BF%E5%88%A9%E5%B1%8B-7-7#486",
      image: "https://pbs.twimg.com/media/Gt1g3FaXUAAgAXj?format=jpg&name=900x900",
      accent: "#7894a3",
      position: "center"
    },
    {
      name: "Reef",
      url: "https://lithium-souls.forumactif.com/t119-benriya-%E4%BE%BF%E5%88%A9%E5%B1%8B-7-7#487",
      image: "https://i.pinimg.com/736x/2e/26/19/2e261979cf7e679d69d9701bd2611cc0.jpg",
      accent: "#916257",
      position: "center"
    },
    {
      name: "Azimuth",
      url: "https://lithium-souls.forumactif.com/t119-benriya-%E4%BE%BF%E5%88%A9%E5%B1%8B-7-7#488",
      image: "https://zupimages.net/up/26/23/izgd.png",
      accent: "#82799a",
      position: "center"
    },
    {
      name: "Makandal",
      url: "https://lithium-souls.forumactif.com/t179-damnees-7#725",
      image: "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/4574dd4b-00ae-41c9-b7f3-75992b40dbe8/dg296ym-b8ae39ae-024a-4e7a-bba5-d1217c5ebc01.jpg/v1/fill/w_1063,h_752,q_70,strp/spit_blood_by_insomniaarts2022_dg296ym-pre.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9OTA1IiwicGF0aCI6Ii9mLzQ1NzRkZDRiLTAwYWUtNDFjOS1iN2YzLTc1OTkyYjQwZGJlOC9kZzI5NnltLWI4YWUzOWFlLTAyNGEtNGU3YS1iYmE1LWQxMjE3YzVlYmMwMS5qcGciLCJ3aWR0aCI6Ijw9MTI4MCJ9XV0sImF1ZCI6WyJ1cm46c2VydmljZTppbWFnZS5vcGVyYXRpb25zIl19.U-yrjOjqWZ7s2nlkBsnnv_ZSDeqHyF00gtzEDUE5Vz0",
      accent: "#b2a36f",
      position: "center"
    },
        {
      name: "Selina",
      url: "https://lithium-souls.forumactif.com/t179-damnees-7#726",
      image: "https://i.pinimg.com/1200x/84/e4/c4/84e4c4538e638ca8311ee7ecde87da04.jpg",
      accent: "#b2a36f",
      position: "center"
    },
        {
      name: "Lucas",
      url: "https://lithium-souls.forumactif.com/t179-damnees-7#727",
      image: "https://i.pinimg.com/1200x/f6/18/37/f618374ab2fdbc6e5498c74defd8a57f.jpg",
      accent: "#b2a36f",
      position: "center"
    },
        {
      name: "Häyhä",
      url: "https://lithium-souls.forumactif.com/t179-damnees-7#728",
      image: "https://cdn.donmai.us/sample/da/f5/__makima_chainsaw_man_drawn_by_eulbhitomi__sample-daf51eb5040cc8bcd5ac51578df22b8b.jpg",
      accent: "#b2a36f",
      position: "center"
    },
        {
      name: "James",
      url: "https://lithium-souls.forumactif.com/t179-damnees-7#729",
      image: "https://i.pinimg.com/control1/736x/79/ab/0e/79ab0ebd65f332e675a6108a22e6cf68.jpg",
      accent: "#b2a36f",
      position: "center"
    },
        {
      name: "Calamity",
      url: "https://lithium-souls.forumactif.com/t179-damnees-7#730",
      image: "https://i.pinimg.com/1200x/36/68/56/3668562064738eefdb45d205515deb09.jpg",
      accent: "#b2a36f",
      position: "center"
    },
        {
      name: "Haya'Kanako",
      url: "https://lithium-souls.forumactif.com/t179-damnees-7#861",
      image: "http://critrole.com/wp-content/uploads/2020/10/@augenbblck.jpg",
      accent: "#b2a36f",
      position: "center"
    },
        {
      name: "Linux",
      url: "https://lithium-souls.forumactif.com/t159-encans-des-monstruosites-3-3#614",
      image: "https://zupimages.net/up/26/26/py25.png",
      accent: "#b2a36f",
      position: "center"
    },
        {
      name: "Constantine",
      url: "https://lithium-souls.forumactif.com/t159-encans-des-monstruosites-3-3#615",
      image: "https://zupimages.net/up/26/26/ajd1.jpg",
      accent: "#b2a36f",
      position: "center"
    },
        {
      name: "Midas",
      url: "https://lithium-souls.forumactif.com/t159-encans-des-monstruosites-3-3#857",
      image: "https://i.pinimg.com/736x/2b/a9/24/2ba92466029e3cb084c54acdcfeccb3e.jpg",
      accent: "#b2a36f",
      position: "center"
    },
        {
      name: "Aborym",
      url: "https://lithium-souls.forumactif.com/t197-grandes-lignees-des-ars-7-7#786",
      image: "https://i.pinimg.com/1200x/d3/75/da/d375dadf55f82fd43af83d335a3ea0e0.jpg",
      accent: "#b2a36f",
      position: "center"
    },
        {
      name: "Lycoris",
      url: "https://lithium-souls.forumactif.com/t197-grandes-lignees-des-ars-7-7#787",
      image: "https://pbs.twimg.com/media/GunKW9zX0AAFMpm?format=jpg&name=900x900",
      accent: "#b2a36f",
      position: "center"
    },
        {
      name: "Kothar",
      url: "https://lithium-souls.forumactif.com/t197-grandes-lignees-des-ars-7-7#830",
      image: "https://i.pinimg.com/1200x/92/9c/d4/929cd4b380c9b91a8e33c59aac2fe8ed.jpg",
      accent: "#b2a36f",
      position: "center"
    },
        {
      name: "Komodrian",
      url: "https://lithium-souls.forumactif.com/t197-grandes-lignees-des-ars-7-7#831",
      image: "https://zupimages.net/up/26/34/buhx.png",
      accent: "#b2a36f",
      position: "center"
    },
        {
      name: "Ose",
      url: "https://lithium-souls.forumactif.com/t197-grandes-lignees-des-ars-7-7#832",
      image: "https://zupimages.net/up/26/34/5jtw.png",
      accent: "#b2a36f",
      position: "center"
    },
        {
      name: "Hesmia",
      url: "https://lithium-souls.forumactif.com/t197-grandes-lignees-des-ars-7-7#833",
      image: "https://zupimages.net/up/26/34/pgq8.png",
      accent: "#b2a36f",
      position: "center"
    },
        {
      name: "Hyperion",
      url: "https://lithium-souls.forumactif.com/t197-grandes-lignees-des-ars-7-7#834",
      image: "https://zupimages.net/up/26/34/lhwh.png",
      accent: "#b2a36f",
      position: "center"
    },
        {
      name: "Gillian",
      url: "https://lithium-souls.forumactif.com/t146-institut-des-technologies-des-sciences-et-des-savoirs-4-5#597",
      image: "https://i.pinimg.com/vwebpf/1200x/4d/a6/bd/4da6bd32775ee80ca40c1e0b9f8c2b57.webp",
      accent: "#b2a36f",
      position: "center"
    },
        {
      name: "Kaya",
      url: "https://lithium-souls.forumactif.com/t146-institut-des-technologies-des-sciences-et-des-savoirs-4-5#598",
      image: "https://i.pinimg.com/736x/ad/55/5f/ad555f1cc94c69f7f02838262632b04d.jpg",
      accent: "#b2a36f",
      position: "center"
    },
        {
      name: "Amavexian",
      url: "https://lithium-souls.forumactif.com/t146-institut-des-technologies-des-sciences-et-des-savoirs-4-5#599",
      image: "https://zupimages.net/up/26/29/jl2k.png",
      accent: "#b2a36f",
      position: "center"
    },
        {
      name: "Vivianne",
      url: "https://lithium-souls.forumactif.com/t146-institut-des-technologies-des-sciences-et-des-savoirs-4-5#601",
      image: "https://cdn.donmai.us/sample/78/7c/__princess_zelda_and_light_dragon_the_legend_of_zelda_and_1_more_drawn_by_an_bfzann__sample-787c431c914c072d9e7540e6f4b6f4b2.jpg",
      accent: "#b2a36f",
      position: "center"
    },
        {
      name: "Ziggy",
      url: "https://lithium-souls.forumactif.com/t95-l-assomoir-4-4#365",
      image: "https://zupimages.net/up/26/35/iq3m.jpg",
      accent: "#b2a36f",
      position: "center"
    },
        {
      name: "Dolorès",
      url: "https://lithium-souls.forumactif.com/t95-l-assomoir-4-4#366",
      image: "https://64.media.tumblr.com/7a80f343649bfaa38a3cfc709f6c5ff7/5cdf134b7897300b-b7/s2048x3072/3ff75cb3d736ef440c4e340b155bfeb4e917fce3.jpg",
      accent: "#b2a36f",
      position: "center"
    },
        {
      name: "Rickadus",
      url: "https://lithium-souls.forumactif.com/t95-l-assomoir-4-4#369",
      image: "https://zupimages.net/up/26/21/6ec8.jpg",
      accent: "#b2a36f",
      position: "center"
    },
        {
      name: "D'jali",
      url: "https://lithium-souls.forumactif.com/t95-l-assomoir-4-4#400",
      image: "https://i.pinimg.com/736x/ee/05/53/ee0553b5fca201800a9ec86a8e388d77.jpg",
      accent: "#b2a36f",
      position: "center"
    },
        {
      name: "Hozier",
      url: "https://lithium-souls.forumactif.com/t89-la-gueule-3-4#252",
      image: "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/5b916ee9-59a7-481d-b97f-a16ca5a29fbf/dln2z4w-67e1a895-4bf9-4548-930c-18b363e73871.png/v1/fit/w_828,h_1242,q_70,strp/legoshi__by_shadokk_dln2z4w-414w-2x.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9MTUzNiIsInBhdGgiOiIvZi81YjkxNmVlOS01OWE3LTQ4MWQtYjk3Zi1hMTZjYTVhMjlmYmYvZGxuMno0dy02N2UxYTg5NS00YmY5LTQ1NDgtOTMwYy0xOGIzNjNlNzM4NzEucG5nIiwid2lkdGgiOiI8PTEwMjQifV1dLCJhdWQiOlsidXJuOnNlcnZpY2U6aW1hZ2Uub3BlcmF0aW9ucyJdfQ.LhnwTLSfx1R7xgLWK35eL9eQz5DgEJRT609KWovbSZI",
      accent: "#b2a36f",
      position: "center"
    },
        {
      name: "Lilou",
      url: "https://lithium-souls.forumactif.com/t89-la-gueule-3-4#254",
      image: "https://cdnb.artstation.com/p/assets/images/images/051/363/365/large/waldemar-45-4-1.jpg?1657110200",
      accent: "#b2a36f",
      position: "center"
    },
        {
      name: "Henzo",
      url: "https://lithium-souls.forumactif.com/t89-la-gueule-3-4#255",
      image: "https://64.media.tumblr.com/309140270a6e3d422a7443db5ffab468/tumblr_o4ecpmzkMd1ukal2to2_1280.jpg",
      accent: "#b2a36f",
      position: "center"
    },
        {
      name: "Euryale",
      url: "https://lithium-souls.forumactif.com/t87-les-gorgones-pourpres-5-5#258",
      image: "https://zupimages.net/up/26/17/9s71.png",
      accent: "#b2a36f",
      position: "center"
    },
        {
      name: "Stheno",
      url: "https://lithium-souls.forumactif.com/t87-les-gorgones-pourpres-5-5#262",
      image: "https://i.pinimg.com/1200x/1b/5f/21/1b5f21013cd74b46baf3cd8045f27cc2.jpg",
      accent: "#b2a36f",
      position: "center"
    },
        {
      name: "Medusa",
      url: "https://lithium-souls.forumactif.com/t87-les-gorgones-pourpres-5-5#276",
      image: "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/1cfca11f-6cb7-400f-97a2-7865103ea5d9/dfpkvei-6bd1e4e4-3bd9-4d82-99fb-189cc4fea512.jpg/v1/fill/w_900,h_765,q_75,strp/neytiri__by_inkonix_dfpkvei-fullview.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9NzY1IiwicGF0aCI6Ii9mLzFjZmNhMTFmLTZjYjctNDAwZi05N2EyLTc4NjUxMDNlYTVkOS9kZnBrdmVpLTZiZDFlNGU0LTNiZDktNGQ4Mi05OWZiLTE4OWNjNGZlYTUxMi5qcGciLCJ3aWR0aCI6Ijw9OTAwIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmltYWdlLm9wZXJhdGlvbnMiXX0.Z2DZ1rT7I34fhiuVTx4L4KLgSDdFRDZJXQsILYyQBww",
      accent: "#b2a36f",
      position: "center"
    },
        {
      name: "Asterius",
      url: "https://lithium-souls.forumactif.com/t87-les-gorgones-pourpres-5-5#479",
      image: "https://pbs.twimg.com/media/EtKjaFiU4AEsjfc?format=jpg&name=900x900",
      accent: "#b2a36f",
      position: "center"
    },
        {
      name: "Raya",
      url: "https://lithium-souls.forumactif.com/t87-les-gorgones-pourpres-5-5#481",
      image: "https://i.pinimg.com/1200x/69/70/97/69709709522d36f765f636f560b1e939.jpg",
      accent: "#b2a36f",
      position: "center"
    },
        {
      name: "Jeremiah",
      url: "https://lithium-souls.forumactif.com/t139-syndicat-des-exploitees-unies-et-mecontentes-5-5#557",
      image: "https://zupimages.net/up/26/24/gkr0.png",
      accent: "#b2a36f",
      position: "center"
    },
        {
      name: "Willa",
      url: "https://lithium-souls.forumactif.com/t139-syndicat-des-exploitees-unies-et-mecontentes-5-5#558",
      image: "https://zupimages.net/up/26/24/b6ek.png",
      accent: "#b2a36f",
      position: "center"
    },
        {
      name: "Ambessa",
      url: "https://lithium-souls.forumactif.com/t139-syndicat-des-exploitees-unies-et-mecontentes-5-5#559",
      image: "https://64.media.tumblr.com/595c3a8eb672ff73962ade5e978f5be4/f2baf9408d30c78d-a0/s1280x1920/d5419af38b9f7a1843ee68ed6b619fd60198162e.jpg",
      accent: "#b2a36f",
      position: "center"
    },
        {
      name: "Theodosius",
      url: "https://lithium-souls.forumactif.com/t139-syndicat-des-exploitees-unies-et-mecontentes-5-5#560",
      image: "https://i.pinimg.com/1200x/bb/ae/4d/bbae4dcd49747849ab531c22ba6223e9.jpg",
      accent: "#b2a36f",
      position: "center"
    },
        {
      name: "Varrick",
      url: "https://lithium-souls.forumactif.com/t139-syndicat-des-exploitees-unies-et-mecontentes-5-5#561",
      image: "https://zupimages.net/up/26/24/c8my.png",
      accent: "#b2a36f",
      position: "center"
    }
  ];

  function shuffleLinks(items) {
    var shuffled = items.slice();
    var currentIndex = shuffled.length;
    var randomIndex;
    var temporaryValue;

    while (currentIndex > 0) {
      randomIndex = Math.floor(
        Math.random() * currentIndex
      );

      currentIndex -= 1;

      temporaryValue = shuffled[currentIndex];
      shuffled[currentIndex] = shuffled[randomIndex];
      shuffled[randomIndex] = temporaryValue;
    }

    return shuffled;
  }

  function createRandomLinks(pa) {
    var container = pa.querySelector(
      "[data-litso-pa_random-links]"
    );

    if (!container) {
      return;
    }

    var selection = shuffleLinks(rotatingLinks).slice(0, 5);

    container.textContent = "";

    selection.forEach(function (item) {
      var link = document.createElement("a");
      var image = document.createElement("img");
      var label = document.createElement("span");

      link.className = "litso-pa_randomlink";
      link.href = item.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.setAttribute(
        "aria-label",
        "Découvrir " + item.name
      );

      if (item.accent) {
        link.style.setProperty(
          "--litso-pa_link-accent",
          item.accent
        );
      }

      if (item.position) {
        link.style.setProperty(
          "--litso-pa_position",
          item.position
        );
      }

      image.src = item.image;
      image.alt = "";
      image.loading = "lazy";
      image.decoding = "async";

      label.textContent = item.name;

      link.appendChild(image);
      link.appendChild(label);
      container.appendChild(link);
    });
  }

  function initLitsoPA() {
    var pa = document.getElementById("litso-pa_root");

    if (
      !pa ||
      pa.getAttribute("data-litso-pa_ready") === "true"
    ) {
      return;
    }

    pa.setAttribute(
      "data-litso-pa_ready",
      "true"
    );

    createRandomLinks(pa);

    var plot = pa.querySelector(".litso-pa_plot");

    var plotToggle = pa.querySelector(
      "[data-litso-pa_plot-toggle]"
    );

    var plotReveal = pa.querySelector(
      ".litso-pa_plotreveal"
    );

    if (plot && plotToggle && plotReveal) {
      plotToggle.addEventListener("click", function () {
        var isOpen = plot.classList.toggle("is-open");
        var label = plotToggle.querySelector("span");
        var icon = plotToggle.querySelector("b");

        plotToggle.setAttribute(
          "aria-expanded",
          String(isOpen)
        );

        plotReveal.setAttribute(
          "aria-hidden",
          String(!isOpen)
        );

        if (label) {
          label.textContent = isOpen
            ? "Refermer le récit"
            : "Découvrir l’intrigue";
        }

        if (icon) {
          icon.textContent = isOpen ? "×" : "↗";
        }
      });
    }

    var partnerSelect = pa.querySelector(
      "[data-litso-pa_partner-select]"
    );

    if (partnerSelect) {
      partnerSelect.addEventListener(
        "change",
        function () {
          var url = partnerSelect.value;

          if (
            url &&
            url.indexOf("URL_DU_") !== 0
          ) {
            window.open(
              url,
              "_blank",
              "noopener,noreferrer"
            );
          }

          partnerSelect.selectedIndex = 0;
        }
      );
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initLitsoPA
    );
  } else {
    initLitsoPA();
  }
})();
