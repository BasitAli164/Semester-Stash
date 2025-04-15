.model small
.stack 100h
.data
.code
    main proc
         
     mov ax,@data
     mov ds,ax
     
     mov bx,5
     mov cx,5
     
     mainLoop:
        push cx
        mov cx,bx
        nestedloop:
            mov dl,"*"
            mov ah,02h
            int 21h
            
       loop nestedloop
        
        
       mov dl,10
       mov ah,2
       int 21h
       
       mov dl,13
       mov ah,2
       int 21h
       
       dec bx
       pop cx
     loop mainLoop
    main endp          
    
            