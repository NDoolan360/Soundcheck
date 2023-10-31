window.onkeydown = function (e) {
    // Prevent reload and known external dialogs.
    if (
        (e.ctrlKey && ['f', 'g', 'p', 'r', 'u'].includes(e.key.toLowerCase())) ||
        ['f3', 'f5'].includes(e.key.toLowerCase())
    )
        e.preventDefault();
};
