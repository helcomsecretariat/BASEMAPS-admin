package fi.fta.utils;

import java.util.Collections;
import java.util.List;

import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.hibernate.HibernateException;

import fi.fta.beans.Category;
import fi.fta.beans.ui.CategoryCountsUI;
import fi.fta.beans.ui.CategorySummaryUI;
import fi.fta.data.managers.CategoryManager;
import fi.fta.data.managers.SimpleUrlServiceManager;
import fi.fta.data.managers.WFSManager;
import fi.fta.data.managers.WMSManager;

public class SummaryWorkbook
{
	
	private static String [] columns = {
		"ID", "Name", "WMS", "WFS", "ARCGis", "Downloadables"};
	
	
	private Workbook workbook;
	
	private Sheet sheet;
	
	private int index;
	
	
	public SummaryWorkbook()
	{
		this.workbook = new XSSFWorkbook();
		this.sheet = workbook.createSheet("Categories");
		this.index = 0;
		Row header = this.sheet.createRow(this.index++);
		for (int i = 0; i < SummaryWorkbook.columns.length; i++)
		{
			header.createCell(i).setCellValue(SummaryWorkbook.columns[i]);
		}
		Font font = this.workbook.createFont();
		font.setBold(true);
		CellStyle style = this.workbook.createCellStyle();
		style.setFont(font);
		header.setRowStyle(style);
	}
	
	public void set(Long id, Integer depth) throws HibernateException
	{
		if (id == null)
		{
			this.set("", CategoryManager.getInstance().getRoot(), depth);
		}
		else
		{
			Category c = CategoryManager.getInstance().get(id);
			if (c != null)
			{
				this.set("", Collections.singletonList(c), depth);
			}
		}
	}
	
	private void set(String prefix, List<Category> categories, Integer depth) throws HibernateException
	{
		for (Category c : categories)
		{
			if (Util.isEmptyCollection(c.getChildren()))
			{
				Row row = sheet.createRow(index++);
				row.createCell(0).setCellValue(c.getId());
				row.createCell(1).setCellValue(
					(Util.isEmptyString(prefix) ? "" : (prefix + " > ")) + c.getLabel());
				row.createCell(2).setCellValue(
					WMSManager.getInstance().countChildren(c.getId()));
				row.createCell(3).setCellValue(
					WFSManager.getInstance().countChildren(c.getId()));
				row.createCell(4).setCellValue(
					SimpleUrlServiceManager.getArcGISInstance().countChildren(c.getId()));
				row.createCell(5).setCellValue(
					SimpleUrlServiceManager.getDownloadableInstance().countChildren(c.getId()));
			}
			else if (depth != null && (depth.intValue() == 1 || depth.intValue() == -1))
			{
				CategoryCountsUI counts = new CategoryCountsUI();
				for (CategorySummaryUI ui : BeansUtils.getSummary(c.getChildren()))
				{
					counts.sum(ui.getCounts());
				}
				Row row = sheet.createRow(index++);
				row.createCell(0).setCellValue(c.getId());
				row.createCell(1).setCellValue(
					(Util.isEmptyString(prefix) ? "" : (prefix + " > ")) + c.getLabel());
				row.createCell(2).setCellValue(counts.getWmses());
				row.createCell(3).setCellValue(counts.getWfses());
				row.createCell(4).setCellValue(counts.getArcgises());
				row.createCell(5).setCellValue(counts.getDownloadables());
			}
			else
			{
				Integer d = depth != null ?
					new Integer(depth.intValue() > 0 ? depth-1 : depth+1) : null;
				if (Util.isEmptyString(prefix))
				{
					this.set(c.getLabel(), c.getChildren(), d);
				}
				else
				{
					this.set(prefix + " > " + c.getLabel(), c.getChildren(), d);
				}
			}
		}
	}
	
	public Workbook getWorkbook()
	{
		return workbook;
	}
	
}
