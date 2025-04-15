.model small
.stack 100h
.data
msg db 0dh,0ah,'Enter the letter in upper case: $'
msg1 db 0dh,0ah,'Letter in lower case is: $'
temp db ?

.code
main proc
    mov ax, @data
    mov ds, ax

    ; Display the prompt message
    mov ah, 09h
    lea dx, msg
    int 21h

    ; Read a character from the user
    mov ah, 01h
    int 21h
    mov temp, al

    ; Convert the uppercase letter to lowercase
    add temp, 20h

    ; Display the result message
    mov ah, 09h
    lea dx, msg1
    int 21h

    ; Display the lowercase letter
    mov ah, 02h
    mov dl, temp
    int 21h

    ; Terminate the program
    mov ah, 4Ch
    int 21h

main endp
end main