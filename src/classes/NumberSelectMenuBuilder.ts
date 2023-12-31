import { StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js";

export class NumberSelectMenuBuilder extends StringSelectMenuBuilder {
	public setRange(from: number, to: number, step: number = 1, getDesc: (arg: string) => string, current?: number) {
		const numberList = this.getNumberRangeList(from, to, step);

		if (numberList.length > 25) {
			throw "Numbers cannot be more than 25";
		}

		return this.addOptions(
			numberList.map((_number) =>
				new StringSelectMenuOptionBuilder()
					.setLabel(_number.toString())
					.setValue(_number.toString())
					.setDescription(getDesc(_number.toString()))
					.setDefault((current ?? numberList[0]) === _number)
			)
		);
	}

	private getNumberRangeList(from: number, to: number, step: number) {
		const list: number[] = [];

		for (let i = from; i <= to; i += step) {
			list.push(i);
		}

		return list;
	}
}
