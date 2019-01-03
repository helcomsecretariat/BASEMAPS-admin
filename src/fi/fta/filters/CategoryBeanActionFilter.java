package fi.fta.filters;

import java.util.Date;

import fi.fta.beans.CategoryBeanAction;

public class CategoryBeanActionFilter extends GenericFilter<CategoryBeanAction>
{
	
	private Long userId;
	
	private Date from;
	
	private Date till;
	
	
	public CategoryBeanActionFilter(Long userId, Date from, Date till)
	{
		this.userId = userId;
		this.from = from;
		this.till = till;
	}
	
	@Override
	public boolean match(CategoryBeanAction bean)
	{
		if (userId != null && !userId.equals(bean.getUserId()))
		{
			return false;
		}
		if (from != null && !from.before(bean.getCreated()))
		{
			return false;
		}
		if (till != null && !till.after(bean.getCreated()))
		{
			return false;
		}
		return true;
	}
	
}
