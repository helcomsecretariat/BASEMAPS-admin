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
	
	@Override
	public WMS add(WMS ent) throws HibernateException
	{
		WMS ret = super.add(ent);
		if (ent.getInfo() != null)
		{
			ent.getInfo().setParent(ret.getId());
			ret.setInfo(new WMSInfoDAO().add(ent.getInfo()));
		}
		return ret;
	}
	
	@Override
	public WMS update(WMS ent) throws HibernateException
	{
		WMS ret = super.update(ent);
		if (ent.getInfo() != null)
		{
			if (ent.getInfo().getParent() == null)
			{
				ent.getInfo().setParent(ent.getId());
				ent.setInfo(new WMSInfoDAO().add(ent.getInfo()));
			}
			else
			{
				ent.setInfo(new WMSInfoDAO().update(ent.getInfo()));
			}
		}
		return ret;
	}
	
}
