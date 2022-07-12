import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line,
    ScatterChart,
    Scatter,
    ZAxis,
} from 'recharts';
import { Container } from '@the-deep/deep-ui';
import { ReportsQuery } from '#generated/types';

import styles from './styles.css';

type paymentPerOrderWindowType = NonNullable<NonNullable<ReportsQuery['moderatorQuery']>['reports']>['paymentPerOrderWindow'];
type bookGradesPerOrderWindowType = NonNullable<NonNullable<ReportsQuery['moderatorQuery']>['reports']>['bookGradesPerOrderWindow'];
type booksAndCostPerSchoolType = NonNullable<NonNullable<ReportsQuery['moderatorQuery']>['reports']>['booksAndCostPerSchool'];
interface windowProps {
    paymentPerOrderWindow: paymentPerOrderWindowType;
    bookGradesPerOrderWindow: bookGradesPerOrderWindowType;
    booksAndCostPerSchool: booksAndCostPerSchoolType;
    orderWindows: {
        window: string;
        fill: string;
    }[] | undefined
}

interface GradeOrder {
    [key: string]: number | string;
    grade: string;
}

function Window(props: windowProps) {
    const { paymentPerOrderWindow,
        bookGradesPerOrderWindow,
        orderWindows,
        booksAndCostPerSchool } = props;

    const gradesOrder = bookGradesPerOrderWindow?.map((bookGrades) => (
        bookGrades?.grades?.map((grade) => (
            { grade: grade.grade, [bookGrades.title]: grade.numberOfBooks }
        )) ?? []
    ));

    const booksPerGradePerOrderWindow = ([] as GradeOrder[]).concat(...(gradesOrder ?? []));

    return (
        <Container
            className={styles.reports}
            heading="Window and Payment"
            headingSize="small"
        >
            <div className={styles.wrapper}>
                <div className={styles.dataVisualizations}>
                    <div className={styles.chartLabel}>
                        Total Payments per Order Window
                    </div>
                    <ResponsiveContainer>
                        <BarChart
                            data={paymentPerOrderWindow ?? undefined}
                            margin={{
                                left: 10,
                                top: 10,
                                right: 10,
                                bottom: 30,
                            }}
                        >
                            <XAxis
                                dataKey="title"
                                label={{
                                    value: 'Order Windows',
                                    position: 'bottom',
                                    textAnchor: 'middle',
                                }}
                            />
                            <YAxis
                                label={{
                                    value: 'Payments in NRs',
                                    angle: -90,
                                    position: 'insideLeft',
                                    textAnchor: 'middle',
                                }}
                                padding={{
                                    top: 30,
                                }}
                            />
                            <Tooltip cursor={false} />
                            <Legend
                                verticalAlign="top"
                            />
                            <Bar
                                dataKey="payment"
                                fill="var(--dui-color-cornflower-blue)"
                                label={{ position: 'top' }}
                                name="Payment"
                                barSize={50}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className={styles.dataVisualizations}>
                    <div className={styles.chartLabel}>
                        Number of Grade books ordered per order window
                    </div>
                    <ResponsiveContainer>
                        <LineChart
                            data={booksPerGradePerOrderWindow}
                            margin={{
                                left: 10,
                                top: 10,
                                right: 10,
                                bottom: 30,
                            }}
                        >
                            <XAxis
                                dataKey="grade"
                                label={{
                                    value: 'Grades',
                                    position: 'bottom',
                                    textAnchor: 'middle',
                                }}
                            />
                            <YAxis
                                label={{
                                    value: 'Number of Books',
                                    angle: -90,
                                    position: 'insideLeft',
                                    textAnchor: 'middle',
                                }}
                                padding={{
                                    top: 30,
                                }}
                            />
                            <Tooltip />
                            <Legend
                                verticalAlign="top"
                            />
                            {orderWindows?.map((item) => (
                                <Line dataKey={item.window} stroke={item.fill} />
                            ))}
                            <Legend />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div className={styles.wrapper}>
                <div className={styles.dataVisualizations}>
                    <div className={styles.chartLabel}>
                        Number of Books and Total Cost per School
                    </div>
                    <ResponsiveContainer>
                        <ScatterChart
                            margin={{
                                left: 10,
                                top: 10,
                                right: 10,
                                bottom: 30,
                            }}
                        >
                            <Tooltip />
                            <Scatter
                                fill="var(--dui-color-princeton-orange)"
                                name="name"
                                data={booksAndCostPerSchool ?? undefined}
                            />
                            <XAxis
                                dataKey="numberOfBooksOrdered"
                                name="Number of Ordered Books"
                                label={{
                                    value: 'Number of Ordered Books',
                                    position: 'bottom',
                                    textAnchor: 'middle',
                                }}
                            />
                            <YAxis
                                dataKey="totalCost"
                                name="Total Cost"
                                label={{
                                    value: 'Total Cost',
                                    angle: -90,
                                    position: 'insideLeft',
                                    textAnchor: 'middle',
                                }}
                                padding={{
                                    top: 30,
                                }}
                            />
                            <ZAxis
                                dataKey="schoolName"
                                name="School"
                            />
                        </ScatterChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </Container>
    );
}

export default Window;
