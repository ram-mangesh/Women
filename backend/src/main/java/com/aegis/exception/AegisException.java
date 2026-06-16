package com.aegis.exception;

public class AegisException extends RuntimeException {
    private final int status;
    public AegisException(int status, String msg) { super(msg); this.status = status; }
    public int getStatus() { return status; }
}
