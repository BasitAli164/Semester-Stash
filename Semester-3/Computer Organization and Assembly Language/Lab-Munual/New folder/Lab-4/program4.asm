.model small
.stack 100h
.data
      msg1 db 0ah,0dh,"Enter first Number:$"
      msg2 db 0ah,0dh,"Enter Second Number:$"
      result db 0ah,0dh,"Subtraction is:$"
      num1 db ?
      num2 db ?
      
.code 
      main proc
        mov ax,@data
        mov ds,ax
        
        mov ah,09h
        lea dx,msg1
        int 21h
        
        mov ah,01h
        int 21h
        
        sub al,48
        mov num1,al
        
        mov ah,09h
        lea dx,msg2
        int 21h
        
        mov ah,01h
        int 21h
        
        sub al,48
        mov num2,al
        
        mov ah,09h
        lea dx,result
        int 21h
        
        mov al,num1
        sub al,num2        
        mov dl,al
        add dl,48        
        mov ah,02h
        int 21h
     main endp
      
        