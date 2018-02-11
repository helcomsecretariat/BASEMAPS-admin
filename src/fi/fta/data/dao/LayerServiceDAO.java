package fi.fta.data.dao;

import java.util.List;

import org.hibernate.HibernateException;

import fi.fta.beans.LayerService;

public class LayerServiceDAO<S extends LayerService> extends CategoryBeanDAO<S>
{
	
	public LayerServiceDAO(Class<S> cls)
	{
		super(cls);
	}
	
	public List<S> getByParent(Long parent) throws HibernateException
	{
		return this.getByField("parent", parent, "position", true);
	}
	
}
