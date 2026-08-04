// tout l'ensemble des détails du qeel

document.addEventListener("DOMContentLoaded", function() {

  // =========================
  // Phrase RP "en ligne"
  // =========================
  let spanOnline = document.querySelector('#last_user_online');
  if (spanOnline) {
    let text = spanOnline.textContent;
    let numbers = text.match(/\d+/g);
    if (numbers && numbers.length >= 4) {
      let total = parseInt(numbers[0]),
          registered = parseInt(numbers[1]),
          hidden = parseInt(numbers[2]),
          guests = parseInt(numbers[3]);

      function word(n, singular, plural){ return n>1?plural:singular; }
      function verb(n, singular, plural){ return n>1?plural:singular; }

      spanOnline.textContent =
        total + " " + word(total,"silhouette","silhouettes") + " " +
        verb(total,"foule","foulent") + " le dallage infernal, " +
        registered + " " + word(registered,"habitant","habitants") + ", " +
        hidden + " " + word(hidden,"spectre","spectres") + " et " +
        guests + " " + word(guests,"vagabond","vagabonds");
    }
  }

  // =========================
  // Dernier inscrit (clean + badge)
  // =========================
let newestUserContainer = document.querySelector('#newest_user');
if (newestUserContainer) {

  let html = newestUserContainer.innerHTML;
  html = html.replace(/L'utilisateur enregistré le plus récent est\s*/i, "");
  newestUserContainer.innerHTML = html;

  let link = newestUserContainer.querySelector('a');
  if (link) {

    let pseudoHTML = link.innerHTML;
    link.innerHTML = "Bienvenue à " + pseudoHTML;

    let colorElement = link.querySelector('span, font') || link;
    let color = window.getComputedStyle(colorElement).color;
    let isUnvalidated = !color || color === "rgb(0, 0, 0)";

    link.style.backgroundColor = isUnvalidated ? "#ccc" : color;
    link.style.color = "#fff";
    link.style.display = "inline-flex";
    link.style.alignItems = "center";
    link.style.justifyContent = "center";
    link.style.textAlign = "center";
    link.style.padding = "6px 14px";
    link.style.borderRadius = "5px";
    link.style.fontWeight = "bold";
    link.style.textDecoration = "none";
    link.style.lineHeight = "1"; 
    link.style.gap = "5px";
  }
}

  // =========================
  // Avatar dernier inscrit (FIX TIMING)
  // =========================
  function loadLastAvatar() {
    let link = document.querySelector('#newest_user a');
    let container = document.querySelector('#ava_lastmember');

    if (!link || !container) {
      setTimeout(loadLastAvatar, 200);
      return;
    }
    if (container.innerHTML.trim() !== "") return;

    fetch(link.href)
      .then(res => res.text())
      .then(html => {
        let doc = new DOMParser().parseFromString(html, "text/html");
        let avatar =
          doc.querySelector('#ls-avalastmember img') ||
          doc.querySelector('.profile_avatar img');
        if (avatar) {
          container.innerHTML = `<img src="${avatar.src}">`;
        } else {
          console.log("❌ Avatar non trouvé");
        }
      })
      .catch(() => console.log("❌ Erreur fetch avatar"));
  }
  loadLastAvatar();

  // =========================
  // phrase "membres en lignes"
  // =========================
  let loggedList = document.querySelector('#logged_in_user_list');
  if (!loggedList) return;

  let users = Array.from(loggedList.querySelectorAll('a'));
  let count = users.length;

  function word(n, singular, plural){ return n > 1 ? plural : singular; }
  function verb(n, singular, plural){ return n > 1 ? plural : singular; }

  let label =
    word(count, "cette", "ces") + " " +
    word(count, "âme", "âmes") + " " +
    verb(count, "foule", "foulent") + " les pavés de bonnes intentions ";

  let cleanList = users.map(user => user.outerHTML).join(", ");

  loggedList.innerHTML =
    "<span class='qeel-label'>" + label + "</span>" + cleanList;
});

  // =========================
  // Nettoyage phrase FA
  // =========================
$(document).ready(function() {
  let $p = $('.hub-indbo_rightblock p');
  if ($p.length) {
    let text = $p.html();
    text = text.replace(/Membres connectés au cours des \d+ dernières heures\s*:/i, '');
    $p.html(text);
  }
});

// =========================
// Stats personnalisées (FIX)
// =========================
function loadStats() {

  let statsBlock = document.querySelector('#hub-indbo_stats');

  if (!statsBlock) {
    setTimeout(loadStats, 200);
    return;
  }

  let text = statsBlock.textContent;

  if (!text || !text.match(/\d/)) {
    setTimeout(loadStats, 200);
    return;
  }

  let numbers = text.match(/\d+/g);

  if (numbers && numbers.length >= 2) {

    let posts = parseInt(numbers[0]);
    let users = parseInt(numbers[1]);

    function word(n, singular, plural){
      return n > 1 ? plural : singular;
    }

    statsBlock.innerHTML = `
  <div class="stat-users">
    <span class="number">${users}</span>
    <span class="label">${word(users, "condamné·e présent·e", "condamné·e·s présent·e·s")}</span>
  </div>
  <div class="stat-posts">
    <span class="number">${posts}</span>
    <span class="label">${word(posts, "offrande", "offrandes")}</span>
  </div>
`;
  }
}

loadStats();
