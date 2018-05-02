package fi.fta.beans.response;

import java.util.List;

import fi.fta.validation.ValidationMessage;

public class SimpleResult<T> extends ItemResult<T>
{

	/**
	 * 
	 */
	private static final long serialVersionUID = 3027089776119237015L;
	
	public static <T> SimpleResult<T> newFailure(Code code, String text)
	{
		return SimpleResult.newInstance(Type.error, code, text, null, null);
	}
	
	public static <T> SimpleResult<T> newFailure(Code code, String text, List<ValidationMessage> validations)
	{
		return SimpleResult.newInstance(Type.error, code, text, validations, null);
	}

	public static <T> SimpleResult<T> noRightsFailure()
	{
		return SimpleResult.newInstance(Type.error, Code.NO_RIGHTS, "No rights", null, null);
	}
	
	public static <T> SimpleResult<T> newSuccess(T item)
	{
		return SimpleResult.newInstance(Type.success, null, null, null, item);
	}
	
	public static <T> SimpleResult<T> newSuccess(String text, T item)
	{
		return SimpleResult.newInstance(Type.success, null, text, null, item);
	}
	
	public static <T> SimpleResult<T> newInstance(Type type, Code code, String text, List<ValidationMessage> validations, T item)
	{
		SimpleResult<T> ret = new SimpleResult<T>();
		ret.setType(type);
		ret.setCode(code);
		ret.setText(text);
		ret.setValidations(validations);
		ret.setItem(item);
		return ret;
	}
	
}
