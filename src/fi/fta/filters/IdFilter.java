package fi.fta.filters;

import java.util.Collection;
import java.util.HashSet;

import fi.fta.beans.Identifiable;

public class IdFilter<T extends Identifiable<?>> extends GenericFilter<T>
{
	
	protected HashSet<Long> ids;
	
	public IdFilter()
	{
		ids = new HashSet<Long>();
	}
	
	public IdFilter(Collection<Long> ids)
	{
		this.setIds(ids);
	}
	
	public HashSet<Long> getIds()
	{
		return ids;
	}

	public void setIds(Collection<Long> ids)
	{
		this.ids = new HashSet<Long>(ids);
	}

	public boolean match(T obj)
	{
		return ids.contains(obj.getId());
	}
	
}
