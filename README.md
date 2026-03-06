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
- `window.TextRipple.startRippleInterval(intervalSeconds, speedMultiplier, root)`
- `window.TextRipple.stopRippleInterval(root)`

`runRipple(1)` runs the effect on every element matching `[data-ripple]`.

## Repeat On An Interval

If you want the effect to run once immediately and then repeat after a fixed delay, use `startRippleInterval(...)`.

This interval starts counting after the previous ripple has fully finished.  
Example: if you pass `30`, the library will:

1. run the ripple immediately
2. wait until that run completes
3. wait 30 more seconds
4. run the ripple again

By default, interval-based reruns keep the current text visible and ripple through it rather than clearing the text first.

Example:

```html
<script>
  window.addEventListener("load", () => {
    window.TextRipple.startRippleInterval(30);
  });
</script>
```

To stop the repeating behavior:

```html
<script>
  window.TextRipple.stopRippleInterval();
</script>
```

## Preserve Existing Text

`scrambleReveal(...)` and `runRipple(...)` support a `preserveText` option.

When `preserveText: true` is used, the ripple disturbs the existing text in place instead of blanking it first.

Example:

```html
<script>
  window.TextRipple.runRipple(1, document, { preserveText: true });
</script>
```

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
      window.TextRipple.startRippleInterval(30);
    });
  </script>
</body>
</html>
```

## Notes

- The library injects the minimal helper CSS it needs for fixed character slots.
- It is designed for plain browser usage and does not require a framework.
- Clicking or other replay behavior is up to the page that consumes it.
