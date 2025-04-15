.model small
.stack 100h
.data
.code
   main proc
    
    mov ax,@data
    mov ds,ax 
    
    
    mov bx,1
    mov cx,5
    
    l1:
    push cx
    mov ah,2
    mov dl,32
    l2:
    int 21h
    loop l2
        mov cx,bx
        mov dl,"*" 
        
    l3:
    int 21h
    loop l3 
    
        mov ah,02
        mov dl,10
        int 21h
        
        
        mov ah,02
        mov dl,13
        int 21h
        
   inc bx
   inc bx
   pop cx
          
   loop l1
   
   
   
   
   
    
        
   
    
        
    
    
    
    
    
    
    
    
    
    
    mov ah,4ch
    int 21h
    
    
    main endp
    end main