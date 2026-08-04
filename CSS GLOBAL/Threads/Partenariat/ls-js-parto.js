function lstabs(evt, lstabsopen) {
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("lsfp_tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("lsfp_tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  document.getElementById(lstabsopen).style.display = "block";
  evt.currentTarget.className += " active";
}

document.getElementById("defaultOpen").click();
