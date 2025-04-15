.model small         
.stack 100h
.data
    msg db "Basit$"

.code
    main proc
        mov ax , @data
        mov ds , ax
        lea si , msg
             
        mov cx , 5
        loop1:
        
        mov bx , [si]
        push bx
        inc si
        
        loop loop1
        
        mov cx , 5
        loop2:
        
        pop dx
        mov ah , 02h
        int 21h
        
        loop loop2
        
        mov ah , 4ch
        int 21h
        
main endp
end main