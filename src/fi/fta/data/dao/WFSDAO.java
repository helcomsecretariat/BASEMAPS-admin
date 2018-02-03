package fi.fta.data.dao;

import java.util.ArrayList;
import java.util.List;

import org.hibernate.HibernateException;

import fi.fta.beans.WFS;

public class WFSDAO extends CategoryBeanDAO<WFS>
{
	
	public WFSDAO()
	{
		super(WFS.class);
	}
	
	public List<WFS> getByParent(Long parent) throws HibernateException
	{
		//return this.getByField("parent", parent, "position", true);
		return new ArrayList<>();
	}
	
	@Override
	public WFS add(WFS ent) throws HibernateException
	{
		WFS ret = super.add(ent);
		if (ent.getInfo() != null)
		{
			ent.getInfo().setParent(ret.getId());
			//ret.setInfo(new WMSInfoDAO().add(ent.getInfo()));
		}
		return ret;
	}
	
	@Override
	public WFS update(WFS ent) throws HibernateException
	{
		WFS ret = super.update(ent);
		if (ent.getInfo() != null)
		{
			if (ent.getInfo().getParent() == null)
			{
				ent.getInfo().setParent(ent.getId());
				//ent.setInfo(new WMSInfoDAO().add(ent.getInfo()));
			}
			else
			{
				//ent.setInfo(new WMSInfoDAO().update(ent.getInfo()));
			}
		}
		return ret;
	}
	
}
