import numpy as np
import json
import cv2

ASSET_NAMES = ["bill", "filibuster", "veto", "novotes"]

for asset_name in ASSET_NAMES:
    img = cv2.imread(f"img/{asset_name}-bw.png", cv2.IMREAD_GRAYSCALE)
    _, img = cv2.threshold(img, 0, 255, cv2.THRESH_BINARY_INV)

    cv2.imshow("Preview", img)
    cv2.waitKey(0)

    output = np.zeros_like(img)
    for y in range(img.shape[0]):
        for x in range(img.shape[1]):
            pixel = img[y, x]
            if pixel == 255:
                output[y, x] = 1

    output = output.tolist()
    print(f"Saved {len(output)}x{len(output[0])} bitmap JSON for \"{asset_name}\" to directory.")
    with open(f"bitmap/{asset_name}.json", "w") as f:
        f.write(json.dumps(output))