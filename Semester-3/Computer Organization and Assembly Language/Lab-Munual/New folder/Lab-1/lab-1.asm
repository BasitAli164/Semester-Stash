.model small 
.stack 100h
.data
    myname db "Basit Ali$"
.code
    main proc
        mov ax,@data
        mov ds,ax 
        
        mov ah,09h
        lea dx,myname
        int 21h 
        
        mov ah,4ch
        int 21h
    main endp
    end main