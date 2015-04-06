; Script to convert image layers to a sprite sheet.
; Copyright (c) 2012 Ross Bamford.
; http://www.apache.org/licenses/LICENSE-2.0.html
(define (script-fu-spritesheet img)
  (let* (
      (layer-count (car  (gimp-image-get-layers img)))
      (layer-ids   (cadr (gimp-image-get-layers img)))
      (sprite-width(car  (gimp-image-width img)))
      (spritesheet-width (* sprite-width layer-count))

      ; Create new image with appropriate size
      (spritesheet-image (car (gimp-image-new 
                                      spritesheet-width
                                      (car (gimp-image-height img)) 
                                      RGB)
                          )
      )
    )

    ; Copy and move each source layer appropriately
    (let (
        (i (- layer-count 1))
      )

      (while (> i -1)
        (let (
            (new-layer (car(gimp-layer-new-from-drawable 
                                      (aref layer-ids i) 
                                      spritesheet-image)
                        )
            )                     
          )

          (gimp-image-insert-layer spritesheet-image new-layer 0 -1)        
          (gimp-layer-translate new-layer (- spritesheet-width (* sprite-width (+ i 1))) 0)
          (gimp-item-set-visible new-layer TRUE)
        )

        (set! i (- i 1))
      )
    )

    ; Merge layers and rename
    (gimp-image-merge-visible-layers spritesheet-image CLIP-TO-IMAGE)
    (gimp-item-set-name (aref (cadr (gimp-image-get-layers spritesheet-image)) 0) "spritesheet")

    ; Create view for new image
    (gimp-display-new spritesheet-image)
  )
)

(script-fu-register "script-fu-spritesheet"
                    "Create spritesheet"
                    "Create a spritesheet from current image layers"
                    "Ross Bamford"
                    "Copyright (c)2012 Ross Bamford"
                    "2012"
                    "*"
                    SF-IMAGE    "Image"         0)
(script-fu-menu-register "script-fu-spritesheet"
                         "<Image>/Sprites")