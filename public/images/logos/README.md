# Team Logo Files

## Folder Structure

```
public/
└── images/
    └── logos/
        ├── local/     # Local League team logos
        ├── state/     # State League team logos
        └── afl/       # AFL team logos
```

## File Naming Convention

**IMPORTANT:** File names must be **lowercase** and match the team names exactly.

### Local League Teams
Place your logo images in `public/images/logos/local/` with these exact filenames:

- `mudcrabs.png` (or .jpg, .svg)
- `bushrangers.png`
- `magpies.png`
- `tigers.png`
- `blues.png`
- `demons.png`
- `lions.png`
- `hawks.png`

### State League Teams
Place your logo images in `public/images/logos/state/`:

- `wildcats.png`
- `scorpions.png`
- `thunder.png`
- `lightning.png`
- `flames.png`
- `cyclones.png`
- `dragons.png`
- `sharks.png`

### AFL Teams
Place your logo images in `public/images/logos/afl/`:

- `collingwood.png`
- `carlton.png`
- `essendon.png`
- `richmond.png`
- `hawthorn.png`
- `geelong.png`
- `sydney.png`
- `brisbane.png`

## Supported Formats

- **.png** (recommended for transparency)
- **.jpg** / **.jpeg**
- **.svg** (vector graphics, scales perfectly)

## Recommended Image Specs

- **Size**: 512x512 pixels (or square aspect ratio)
- **Format**: PNG with transparent background
- **File size**: Keep under 100KB for fast loading

## How It Works

1. Place your image files in the appropriate folder
2. Name them exactly as shown above (lowercase, no spaces)
3. The game will automatically load them from the `public/` folder
4. If an image is missing, the game falls back to emoji logos

## Example

If you have a Mudcrabs logo:
1. Save it as `mudcrabs.png`
2. Place it in `public/images/logos/local/mudcrabs.png`
3. Restart the dev server if it's running
4. The logo will appear in-game!

## Troubleshooting

**Logo not showing?**
- Check the filename is lowercase and spelled correctly
- Make sure the file is in the correct folder
- Try a different image format (PNG recommended)
- Restart the dev server (`npm run dev`)
- Check browser console for 404 errors
