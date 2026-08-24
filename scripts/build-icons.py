from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1]
source = root / "public" / "app-icon.png"
icon = Image.open(source).convert("RGBA")

# Windows uses a size ladder inside .ico; the tray needs a compact raster asset.
icon.save(root / "public" / "icon.ico", format="ICO", sizes=[(16, 16), (20, 20), (24, 24), (32, 32), (40, 40), (48, 48), (64, 64), (128, 128), (256, 256)])
icon.resize((64, 64), Image.Resampling.LANCZOS).save(root / "public" / "tray-icon.png", format="PNG", optimize=True)
