print macro p1
    lea dx,p1
    mov ah,09h
    int 21h 
endm

.model small
.stack 100h
.data
    str1 db "Basit$"
    str2 db "I am a Student$" 
    str3 db "University of Baltistan$"
    str4 db "Skardu$"
    str5 db "Kushmarah Gond$"
.code
main proc
    mov ax,@data
    mov ds,ax
    
   print str1
   call newline
   print str2 
   call newline   
   print str3
   call newline
   print str4
   call newline
   print str5
   
   
   mov ah,4ch
   int 21h
main endp

   newline proc ; make a function to create a new line
        mov dx,10
        mov ah,2
        int 21h
        
        mov dx,13
        mov ah,2
        int 21h
        
        
        
        
        ret 
        newline endp 