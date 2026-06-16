package com.aegis.exception;

public class NotFoundException extends AegisException {
    public NotFoundException(String msg) { super(404, msg); }
}
