```css
/* OptionContract.css */
.OptionContract { }
.OptionContract--inTheMoney { }
.OptionContract__strike { }
.OptionContract__expiration { }
```

- `.OptionContract` is the "block" and represents the higher-level component
- `.OptionContract__strike` is an "element" and represents a descendant of `.OptionContract` that helps compose the block as a whole.
- `.OptionContract--inTheMoney` is a "modifier" and represents a different state or variation on the `.OptionContract` block.