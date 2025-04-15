.model small
.stack 100h
.data
password db 'basit$'
buffer db 20 dup(?)
msg1 db 'enter your password$'
msg2 db 0ah,0dh,'incorrect passowrd$'
msg3 db 0ah,0dh ,'Correct password$'

.code
 main proc
    mov ax,@data
    mov ds,ax
    
    lea si , password
    lea di, buffer
    mov ah,09h
    lea dx,msg1
    int 21h
    
    mov cx ,6
    start:
    mov ah,07
    int 21h
    mov [di],al
    inc di
    
contp:
mov ah ,02h
mov dl,23h
int 21h

loop start
lea si ,password
lea di, buffer
mov cx , 6
mov bx, 0

again:
mov bl ,[si]
mov bh,[di]
inc si
inc di
      
cmp bl,bh
jne error:
loop again

mov ah,09h
lea dx,msg3

int 21h
jmp exit:

error:
mov ah,09h
lea dx,msg2
int 21h

exit:
mov ah,4ch
int 21h

main endp
 end main