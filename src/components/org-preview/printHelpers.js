// Opens a self-contained browser print window with the given content HTML and
// triggers the print dialog directly (no download).
//
// contentHtml already includes any <style> needed (the shared styles below cover
// the common content classes; .docx passes its own docx-preview styles along too).
//
// Returns true on success, or false if the pop-up was blocked.
export const openPrintWindow = (contentHtml) => {
  const win = window.open('', '_blank', 'width=820,height=640');
  if (!win) return false;

  win.document.write(`<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>Print</title>
<style>
  * { box-sizing: border-box; }
  body { margin: 0; padding: 36px; color: #111; font-family: -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
  .content-text { margin: 0; white-space: pre-wrap; word-break: break-word; font-family: -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; font-size: 14px; line-height: 1.7; }
  .content-media { max-width: 100%; height: auto; }
  .content-frame { width: 100%; height: 100vh; border: 1px solid #ddd; border-radius: 6px; }
  @media print { body { padding: 0; } }
</style>
</head>
<body>
  <main>
    ${contentHtml}
  </main>
  <script>
    var printed = false;
    function doPrint() { if (printed) return; printed = true; window.focus(); window.print(); }
    var targets = Array.prototype.slice.call(document.querySelectorAll('img, iframe'));
    if (targets.length === 0) {
      setTimeout(doPrint, 80);
    } else {
      var loaded = 0;
      targets.forEach(function (el) {
        if (el.tagName === 'IMG' && el.complete) { loaded++; if (loaded >= targets.length) setTimeout(doPrint, 80); }
        else el.addEventListener('load', function () { loaded++; if (loaded >= targets.length) setTimeout(doPrint, 80); });
      });
      setTimeout(doPrint, 3000); // fallback in case a cross-origin resource never fires load
    }
  </script>
</body>
</html>`);
  win.document.close();
  return true;
};