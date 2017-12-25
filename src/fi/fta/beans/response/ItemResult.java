package fi.fta.beans.response;

public class ItemResult<T> extends ResponseMessage
{

	/**
	 * 
	 */
	private static final long serialVersionUID = 3795712988989750721L;
	
	private T item;
	
	public ItemResult()
	{
		super();
	}
	
	public ItemResult(T item)
	{
		this();
		this.item = item;
	}
	
	public T getItem() {
		return item;
	}

	public void setItem(T item) {
		this.item = item;
	}
	
}
