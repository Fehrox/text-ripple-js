# Text Ripple JS

`text-ripple.js` is a small browser library that creates a page-load text ripple effect inspired by `musicforprogramming.net`.

It works by:

- finding text inside elements marked with `data-ripple`
- splitting that text into fixed-width character slots
- randomizing each character through glyphs
- resolving those glyphs back into the original text in a moving wave

The library is hosted at:

`http://seb.fehr.work/text-ripple-js/text-ripple.js`

## Use It

Include the script in your page:

```html
<script src="http://seb.fehr.work/text-ripple-js/text-ripple.js"></script>
```

Add `data-ripple` to any element you want animated:

```html
<div data-ripple data-duration="1900" data-delay="120">
  This text will ripple when the effect runs.
</div>
```

Run the effect:

```html
<script>
  window.addEventListener("load", () => {
    window.TextRipple.runRipple(1);
  });
</script>
```

## Options

Each ripple target can define:

- `data-duration`: animation duration in milliseconds
- `data-delay`: delay before that target starts in milliseconds

Example:

```html
<p data-ripple data-duration="2200" data-delay="300">
  Longer delayed ripple text.
</p>
```

## API

The library exposes `window.TextRipple`.

Most people only need:

- `window.TextRipple.runRipple(speedMultiplier)`
- `window.TextRipple.scrambleReveal(element, options)`
- `window.TextRipple.cancelAnimations()`

`runRipple(1)` runs the effect on every element matching `[data-ripple]`.

## Example

```html
<!doctype html>
<html lang="en">
<body>
  <main>
    <h1 data-ripple data-duration="2000">Hello world</h1>
    <p data-ripple data-delay="150">
      This paragraph will animate after the heading.
    </p>
  </main>

  <script src="http://seb.fehr.work/text-ripple-js/text-ripple.js"></script>
  <script>
    window.addEventListener("load", () => {
      window.TextRipple.runRipple(1);
    });
  </script>
</body>
</html>
```

## Notes

- The library injects the minimal helper CSS it needs for fixed character slots.
- It is designed for plain browser usage and does not require a framework.
- Clicking or other replay behavior is up to the page that consumes it.
