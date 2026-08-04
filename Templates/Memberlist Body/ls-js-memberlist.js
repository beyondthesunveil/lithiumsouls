document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.ls-memberlist_pseudo').forEach(pseudo => {
    const groupSpan = pseudo.querySelector('.usr_grp_clr');

    if (!groupSpan) return;

    const groupClass = [...groupSpan.classList]
        .find(cls => cls.startsWith('group-'));

    if (groupClass) {
        pseudo.classList.add(groupClass);
    }
  });
});
