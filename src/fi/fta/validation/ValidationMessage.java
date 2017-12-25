package fi.fta.validation;

import java.util.Collections;
import java.util.List;

public class ValidationMessage
{
	
	private String message;
	private ValidationField field;
	
	public ValidationMessage()
	{}
	
	public ValidationMessage(String message)
	{
		this();
		this.message = message;
	}
	
	public ValidationMessage(String message, ValidationField field)
	{
		this(message);
		this.field = field;
	}
	
	public String getMessage() {
		return message;
	}

	public void setMessage(String message) {
		this.message = message;
	}

	public ValidationField getField() {
		return field;
	}

	public void setField(ValidationField field) {
		this.field = field;
	}
	
	
	public static ValidationMessage simple(String key, String name)
	{
		return new ValidationMessage(key, new ValidationField(name));
	}
	
	public static List<ValidationMessage> single(String key, String name)
	{
		return Collections.singletonList(ValidationMessage.simple(key, name));
	}
	
}
