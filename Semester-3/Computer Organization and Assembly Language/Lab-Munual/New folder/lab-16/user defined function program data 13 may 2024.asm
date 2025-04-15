.model small
.stack 100h
.data
    myname db "Basit Ali$"
    myfatherName db  "Ali$" 
    courseName db "COAL$"
    
.code
    main proc
        mov ax,@data
        mov ds,ax
        
       
        mov ah,09h  
        mov dx,offset myname
         int 21h 
         call newline
        
         
        mov ah,09h
        mov dx,offset myfatherName
        int 21h 
         call newline 
        call getchar
         
        mov ah,09h
        lea dx, courseName
        int 21h   
         call newline
         
         
        
        
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
    
    
       end main 
   