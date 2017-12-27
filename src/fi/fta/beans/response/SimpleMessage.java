package fi.fta.beans.response;

import java.util.List;

import fi.fta.validation.ValidationMessage;

public class SimpleMessage extends ResponseMessage
{
	
	/**
	 * 
	 */
	private static final long serialVersionUID = 4555298178629334858L;
	
	public static SimpleMessage newFailure(Code code, String text)
	{
		return SimpleMessage.newInstance(Type.error, code, text, null);
	}
	
	public static SimpleMessage newFailure(Code code, String text, List<ValidationMessage> validations)
	{
		return SimpleMessage.newInstance(Type.error, code, text, validations);
	}
	
	public static SimpleMessage newSuccess()
	{
		return SimpleMessage.newInstance(Type.success, null, null, null);
	}
	
	public static SimpleMessage newSuccess(String text)
	{
		return SimpleMessage.newInstance(Type.success, null, text, null);
	}
	
	public static SimpleMessage newInstance(Type type, Code code, String text, List<ValidationMessage> validations)
	{
		SimpleMessage ret = new SimpleMessage();
		ret.setType(type);
		ret.setCode(code);
		ret.setText(text);
		ret.setValidations(validations);
		return ret;
	}
	
}
