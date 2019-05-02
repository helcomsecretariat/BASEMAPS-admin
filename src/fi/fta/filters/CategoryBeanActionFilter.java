package fi.fta.filters;

import java.util.Date;

import fi.fta.beans.CategoryBeanAction;
import fi.fta.beans.UserRole;

public class CategoryBeanActionFilter extends GenericFilter<CategoryBeanAction>
{
		
	private Long userId;
	
	private UserRole userRole;
	
	private Date from;
	
	private Date till;
	
	
	public CategoryBeanActionFilter(Long userId, UserRole userRole, Date from, Date till)
	{
		this.userId = userId;
		this.userRole = userRole;
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
		if (userRole != null && !userRole.equals(bean.getRole()))
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
