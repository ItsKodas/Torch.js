function uninstall() {
    if (!confirm("Are you sure you want to uninstall SectorToolbox?")) return
    fetch("/uninstall")
}