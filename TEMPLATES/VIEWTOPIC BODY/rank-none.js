$(function () {
  $('.litso-msg_rank').each(function () {
    const hasRankText = this.textContent.trim().length > 0;
    const hasRankImage = Array.from(this.querySelectorAll('img')).some(
      (image) => (image.getAttribute('src') || '').trim().length > 0
    );

    if (!hasRankText && !hasRankImage) {
      this.style.display = 'none';
    }
  });
});
