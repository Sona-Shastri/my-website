from PIL import Image, ImageDraw

W = H = 200
M = 14        # outer margin / bump amplitude
T = 22        # white band thickness
IN = M + T    # inner edge of band (= border-image slice)
rb = 14       # bump radius
period = 24   # spacing between scallop bumps

WHITE = (255, 255, 255, 255)
DOT = (203, 195, 227, 255)   # lavender #cbc3e3

img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
d = ImageDraw.Draw(img)

# 1) White square ring (band) with straight edges
d.rectangle([M, M, W - M - 1, H - M - 1], fill=WHITE)
d.rectangle([IN, IN, W - IN - 1, H - IN - 1], fill=(0, 0, 0, 0))

# 2) Scallop bumps around the whole outer perimeter (overlapping -> seamless wave)
n = round((W - 2 * M) / period)
centers = [M + i * (W - 2 * M) / n for i in range(n + 1)]

def bump(cx, cy):
    d.ellipse([cx - rb, cy - rb, cx + rb, cy + rb], fill=WHITE)

for c in centers:
    bump(c, M)          # top
    bump(c, H - M)      # bottom
    bump(M, c)          # left
    bump(W - M, c)      # right

# 3) Re-cut the transparent center (bumps may have intruded)
d.rectangle([IN, IN, W - IN - 1, H - IN - 1], fill=(0, 0, 0, 0))

# 4) Little lavender dots, one per bump, sitting just inside the band
dr = 2.4
def dot(cx, cy):
    d.ellipse([cx - dr, cy - dr, cx + dr, cy + dr], fill=DOT)

for c in centers:
    dot(c, M + 8)
    dot(c, H - M - 8)
    dot(M + 8, c)
    dot(W - M - 8, c)

img.save("public/lace-frame.png")
print("Saved lace-frame.png ; slice (inner edge) =", IN)
