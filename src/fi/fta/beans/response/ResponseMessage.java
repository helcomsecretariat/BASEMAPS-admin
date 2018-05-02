package fi.fta.beans.response;

import java.io.Serializable;
import java.util.List;

import fi.fta.validation.ValidationMessage;

public class ResponseMessage implements Serializable
{
	
	/**
	 * 
	 */
	private static final long serialVersionUID = 5961678421453093160L;
	
	public enum Type
	{
		success, warn, error, info;
	}
	
	public enum Code
	{
		ERROR_GENERAL, ERROR_VALIDATION, NO_RIGHTS;
	}
	
	private Type type;
	private Code code;
	private String text;
	private List<? extends ValidationMessage> validations;
	
	
	public ResponseMessage()
	{}
	
	public ResponseMessage(Type type, Code code, String text)
	{
		this();
		this.type = type;
		this.code = code;
		this.text = text;
	}
	
	public ResponseMessage(Type type, Code code, List<? extends ValidationMessage> validations)
	{
		this();
		this.type = type;
		this.code = code;
		this.validations = validations;
	}
	
	public Type getType() {
		return type;
	}
	
	public void setType(Type type) {
		this.type = type;
	}
	
	public Code getCode() {
		return code;
	}
	
	public void setCode(Code code) {
		this.code = code;
	}
	
	public String getText() {
		return text;
	}
	
	public void setText(String text) {
		this.text = text;
	}
	
	public List<? extends ValidationMessage> getValidations() {
		return validations;
	}
	
	public void setValidations(List<? extends ValidationMessage> validations) {
		this.validations = validations;
	}
	
}
