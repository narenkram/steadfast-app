```css
/* OptionContract.css */
.OptionContract { }
.OptionContract--inTheMoney { }
.OptionContract__strike { }
.OptionContract__expiration { }

/* Using IDs */
#optionTrader { }
#optionChain { }
```

BEM Class Naming Convention:
- `.OptionContract` is the "block" and represents the higher-level component
- `.OptionContract__strike` is an "element" and represents a descendant of `.OptionContract` that helps compose the block as a whole.
- `.OptionContract--inTheMoney` is a "modifier" and represents a different state or variation on the `.OptionContract` block.

Using IDs in CSS:
- IDs are denoted by the `#` symbol in CSS
- Each ID should be unique within a page
- IDs have higher specificity than classes, so use them sparingly
- Examples: `#optionTrader` for a main trader component, `#optionChain` for an option chain display

Best Practices:
- Use classes for reusable styles (BEM methodology)
- Use IDs for unique, one-off styling or JavaScript hooks
- Avoid overusing IDs to prevent specificity issues