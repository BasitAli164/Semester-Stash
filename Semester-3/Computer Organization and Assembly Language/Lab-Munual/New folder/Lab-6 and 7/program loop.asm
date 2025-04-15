.model samll 
.stack 100h
.data 
    message db 0ah,0dh,"University of Baltistan$"
.code
    main proc
        mov ax,@data
        mov ds,ax
        
        mov cx,10
        loop1:
            mov ah,09h
            lea dx,message
            int 21h
            
        loop loop1
        
        mov ah,4ch
        int 21h
        
     man endp
    end main 