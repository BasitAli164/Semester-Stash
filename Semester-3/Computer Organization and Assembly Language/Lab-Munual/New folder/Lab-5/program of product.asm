.model small 
.stack 100h
.data
    num1 db 0ah,0dh,"Enter First Number:$"
    num2 db 0ah,0dh,"Enter Second Number:$"
    result db 0ah,0dh,"Result is:$"
.code
    main proc
        mov ax,@data
        mov ds,ax
        
        mov ah,09h
        lea dx,num1
        int 21h
        
        mov ah,01h
        int 21h
        
        mov bl,al
        sub bl,48
        
        mov ah,09h
        lea dx,num2
        int 21h
        
        mov ah,01h
        int 21h
        
        sub al,48
        mul bl
        
        mov bl,al
        add bl,48
        
        mov ah,09h
        lea dx,result
        int 21h
        
        mov dl,bl
        mov ah,02h
        int 21h
        
     main endp
    end main