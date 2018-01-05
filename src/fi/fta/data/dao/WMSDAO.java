package fi.fta.data.dao;

import java.util.List;

import org.hibernate.HibernateException;

import fi.fta.beans.WMS;

public class WMSDAO extends CategoryBeanDAO<WMS>
{
	
	public WMSDAO()
	{
		super(WMS.class);
	}
	
	public List<WMS> getByParent(Long parent) throws HibernateException
	{
		return this.getByField("parent", parent);
	}
	
}
